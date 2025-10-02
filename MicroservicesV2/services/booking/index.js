import express from "express";
import mysql from "mysql2/promise";
import { Kafka } from "kafkajs";
import client from "prom-client";
import { publishOutbox } from "./outboxPublisher.js";
import { startPaymentConsumer } from "./consumers/paymentEvents.js";

const app = express();
app.use(express.json());

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });
const reservationsCounter = new client.Counter({
  name: "reservations_created_total",
  help: "Number of reservations created"
});
register.registerMetric(reservationsCounter);

// DB
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Kafka
const kafka = new Kafka({ brokers: process.env.KAFKA_BROKERS.split(",") });

app.post("/reservations", async (req, res) => {
  const { passenger_id, flight_number, seat_number } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO reservation (passenger_id, flight_number, seat_number, status) VALUES (?,?,?, 'PENDING')",
      [passenger_id, flight_number, seat_number]
    );
    const reservationId = result.insertId;
    reservationsCounter.inc();
    await db.query(
      "INSERT INTO outbox(type,payload) VALUES (?,?)",
      ["PaymentAuthorizeRequested", JSON.stringify({ reservationId, amount: 450, currency: "EUR" })]
    );
    await publishOutbox(db, kafka);
    res.status(202).json({ reservationId, status: "PENDING" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating reservation");
  }
});

app.get("/reservations/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM reservation WHERE id=?", [req.params.id]);
  if (rows.length === 0) return res.status(404).send({ error: "Not found" });
  res.json(rows[0]);
});

app.get("/passengers", async (_req, res) => {
  const [rows] = await db.query("SELECT * FROM passenger");
  res.json(rows);
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

startPaymentConsumer();

app.listen(3000, () => console.log("Booking service running on :3000"));
