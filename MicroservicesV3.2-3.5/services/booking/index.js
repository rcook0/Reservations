import express from "express";
import mysql from "mysql2/promise";
import { Kafka } from "kafkajs";
import client from "prom-client";
import avro from "avsc";
import fs from "fs";
import { SchemaRegistry, readAVSCAsync } from "@kafkajs/confluent-schema-registry";
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


// DB connection
const db = await mysql.createPool({ 
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME 
});

// Kafka client
const kafka = new Kafka({ brokers: process.env.KAFKA_BROKERS.split(",") });
const producer = kafka.producer();
await producer.connect();

const registryUrl = process.env.SCHEMA_REGISTRY_URL;
let registry = null;
if (registryUrl) registry = new SchemaRegistry({ host: registryUrl });

// Local Avro fallback
const localSchemas = {
  paymentReq: avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/payment-authorize-requested.avsc", import.meta.url)))),
  paymentAuth: avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/payment-authorized.avsc", import.meta.url)))),
  paymentFailed: avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/payment-failed.avsc", import.meta.url)))),
  passengerCreated: avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/passenger-created.avsc", import.meta.url)))),
  reservationCancelled: avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/reservation-cancelled.avsc", import.meta.url))))
};

// Registry subjects (if schema registry is present)
let subjects = {};
if (registry) {
  const load = async (path, subject) => {
    const schema = await readAVSCAsync(new URL(path, import.meta.url));
    const { id } = await registry.register({ type: "avro", schema: JSON.stringify(schema) }, { subject });
    subjects[subject] = id;
  };
  await load("../../contracts/payment-authorize-requested.avsc", "payment.commands-value");
  await load("../../contracts/payment-authorized.avsc", "payment.events-value");
  await load("../../contracts/payment-failed.avsc", "payment.events-value");
  await load("../../contracts/passenger-created.avsc", "passenger.events-value");
  await load("../../contracts/reservation-cancelled.avsc", "reservation.events-value");
}

// Helpers to encode
function encode(subject, obj, fallbackType) {
  if (registry && subjects[subject]) return registry.encode(subjects[subject], obj);
  return fallbackType.toBuffer(obj);
}

// Create reservation -> publish PaymentAuthorizeRequested
app.post("/reservations", async (req, res) => {
  const { passenger_id, flight_number, seat_number } = req.body;
  if (!passenger_id || !flight_number || !seat_number) 
    return res.status(400).json({error:"Missing fields"});
  
  try {
    const [r] = await db.query(
      "INSERT INTO reservation (passenger_id, flight_number, seat_number, status) VALUES (?,?,?, 'PENDING')", 
      [passenger_id, flight_number, seat_number]
    );
    const reservationId = r.insertId;
    
    reservationsCounter.inc();
    
    const msg = { reservationId, amount: 450, currency: "EUR" };
    const payload = await encode("payment.commands-value", msg, localSchemas.paymentReq);
    // await producer.send({ topic: "payment.commands", messages: [{ value: payload }] });

    await db.query(
      "INSERT INTO outbox(type,payload) VALUES (?,?)",
      ["PaymentAuthorizeRequested", JSON.stringify({ reservationId, amount: 450, currency: "EUR" })]
    );

    await publishOutbox(db, kafka);
    
    res.status(202).json({ reservationId, status: "PENDING" });
  } catch (e) { 
    console.error(e); 
    res.status(500).send("Error creating reservation"); 
  }
});

// Get reservation by ID
app.get("/reservations/:id", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM reservation WHERE id=?", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({error:"Not found"});
  res.json(rows[0]);
});

app.get("/passengers", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM passenger");
  res.json(rows);
});

// Create passenger -> publish PassengerCreated
app.post("/passengers", async (req, res) => {
  const { forename, surname } = req.body;
  if (!forename || !surname) return res.status(400).json({error:"Missing fields"});
  try {
    const [r] = await db.query("INSERT INTO passenger (forename, surname) VALUES (?,?)", [forename, surname]);
    const id = r.insertId;
    const payload = await encode("passenger.events-value", { id, forename, surname }, localSchemas.passengerCreated);
    await producer.send({ topic: "passenger.events", messages: [{ value: payload }] });
    res.status(201).json({ id, forename, surname });
  } catch (e) { console.error(e); res.status(500).send("Error creating passenger"); }
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Start Kafka consumer for payment events
startPaymentConsumer();

// Start HTTP Server
app.listen(3000, () => console.log("Booking service running on :3000"));
