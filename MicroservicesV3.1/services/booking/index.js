import express from "express";
import mysql from "mysql2/promise";
import { Kafka } from "kafkajs";
import avro from "avsc";
import fs from "fs";

const app = express();
app.use(express.json());

// DB pool
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Kafka
const kafka = new Kafka({ brokers: process.env.KAFKA_BROKERS.split(",") });
const producer = kafka.producer();
await producer.connect();

// Load Avro schemas
const schemaPaymentReq = avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/payment-authorize-requested.avsc", import.meta.url))));
const schemaPaymentAuth = avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/payment-authorized.avsc", import.meta.url))));
const schemaPaymentFailed = avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/payment-failed.avsc", import.meta.url))));
const schemaPassengerCreated = avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/passenger-created.avsc", import.meta.url))));
const schemaReservationCancelled = avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/reservation-cancelled.avsc", import.meta.url))));

// --- REST endpoints ---

// Create reservation -> publish PaymentAuthorizeRequested
app.post("/reservations", async (req, res) => {
  const { passenger_id, flight_number, seat_number } = req.body;
  if (!passenger_id || !flight_number || !seat_number) return res.status(400).json({error:"Missing fields"});
  try {
    const [r] = await db.query(
      "INSERT INTO reservation (passenger_id, flight_number, seat_number, status) VALUES (?,?,?, 'PENDING')",
      [passenger_id, flight_number, seat_number]
    );
    const reservationId = r.insertId;

    const evt = { reservationId, amount: 450, currency: "EUR" };
    const buffer = schemaPaymentReq.toBuffer(evt);
    await producer.send({ topic: "payment.commands", messages: [{ value: buffer }] });

    res.status(202).json({ reservationId, status: "PENDING" });
  } catch (err) {
    console.error("Create reservation error:", err);
    res.status(500).send("Error creating reservation");
  }
});

// Get reservation by ID
app.get("/reservations/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM reservation WHERE id=?", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({error:"Not found"});
  res.json(rows[0]);
});

// Create passenger -> publish PassengerCreated
app.post("/passengers", async (req, res) => {
  const { forename, surname } = req.body;
  if (!forename || !surname) return res.status(400).json({error:"Missing fields"});
  try {
    const [r] = await db.query("INSERT INTO passenger (forename, surname) VALUES (?,?)", [forename, surname]);
    const id = r.insertId;
    const evt = { id, forename, surname };
    const buffer = schemaPassengerCreated.toBuffer(evt);
    await producer.send({ topic: "passenger.events", messages: [{ value: buffer }] });
    res.status(201).json({ id, forename, surname });
  } catch (err) {
    console.error("Create passenger error:", err);
    res.status(500).send("Error creating passenger");
  }
});

// --- Kafka consumer for payment.events (PaymentAuthorized/PaymentFailed) ---
const consumer = kafka.consumer({ groupId: "booking-service" });
await consumer.connect();
await consumer.subscribe({ topic: "payment.events", fromBeginning: true });

consumer.run({
  eachMessage: async ({ message }) => {
    // Try authorized first
    try {
      const auth = schemaPaymentAuth.fromBuffer(message.value);
      await db.query("UPDATE reservation SET status='CONFIRMED' WHERE id=?", [auth.reservationId]);
      console.log("Reservation confirmed:", auth.reservationId);
      return;
    } catch {}

    // If not authorized, try failed
    try {
      const fail = schemaPaymentFailed.fromBuffer(message.value);
      await db.query("UPDATE reservation SET status='FAILED' WHERE id=?", [fail.reservationId]);
      console.warn("Reservation failed:", fail);

      // publish ReservationCancelled for any downstream (e.g., seat inventory)
      const buffer = schemaReservationCancelled.toBuffer({ id: fail.reservationId, reason: fail.reason });
      await producer.send({ topic: "reservation.events", messages: [{ value: buffer }] });
    } catch (err) {
      console.error("Unknown message on payment.events:", err);
    }
  }
});

app.listen(3000, () => console.log("Booking service running on :3000"));
