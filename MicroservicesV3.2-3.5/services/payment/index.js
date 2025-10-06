import express from "express";
import mysql from "mysql2/promise";
import { Kafka } from "kafkajs";
import avro from "avsc";
import fs from "fs";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";

const app = express();
app.use(express.json());

// DB connection
const db = await mysql.createPool({ 
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME 
});

// Kafka client
const kafka = new Kafka({ brokers: process.env.KAFKA_BROKERS.split(",") });
const consumer = kafka.consumer({ groupId: "payment-service" });
const producer = kafka.producer();

// Subscribe to booking events
await consumer.connect();
await producer.connect();
await consumer.subscribe({ topic: "payment.commands", fromBeginning: true });

const registryUrl = process.env.SCHEMA_REGISTRY_URL;
let registry = null;
if (registryUrl) registry = new SchemaRegistry({ host: registryUrl });

// local fallback types
const tReq = avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/payment-authorize-requested.avsc", import.meta.url))));
const tAuth = avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/payment-authorized.avsc", import.meta.url))));
const tFailed = avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/payment-failed.avsc", import.meta.url))));

function decodePaymentCommand(value) {
  if (registry) {
    try { return registry.decode(value); } catch {}
  }
  return tReq.fromBuffer(value);
}
async function encodeEvent(obj, subject, fallbackType) {
  if (registry) {
    const { id } = await registry.getLatestSchemaId(subject).catch(() => ({ id: null }));
    if (id) return registry.encode(id, obj);
  }
  return fallbackType.toBuffer(obj);
}

consumer.run({
  eachMessage: async ({ message }) => {
    const evt = JSON.parse(message.value.toString());
    //const shouldFail = evt.reservationId % 2 === 0;
    console.log("Processing payment event", evt);

    /*if (shouldFail) {
      const fail = { reservationId: evt.reservationId, reason: "Card declined (even IDs demo)" };
      const payload = await encodeEvent(fail, "payment.events-value", tFailed);
      await producer.send({ topic: "payment.events", messages: [{ value: payload }] });
      console.warn("PaymentFailed published", fail);
      return;
    }*/

    let attempts = 0;
    const maxRetries = 3;

    while (attempts < maxRetries) {
    try {
      // Store payment
      await db.query
        ("INSERT INTO payment (reservation_id, status, amount, currency) VALUES (?,?,?,?)",
        [evt.reservationId, "AUTHORIZED", evt.amount, evt.currency]
        );
      
      //const ok = { reservationId: evt.reservationId };
      //const payload = await encodeEvent(ok, "payment.events-value", tAuth);

      // Publish back to booking
      await producer.send({ 
        topic: "payment.events", 
        messages: [{ value: JSON.stringify({ type: "PaymentAuthorized", reservationId: evt.reservationId }) }]
      });
      console.log("PaymentAuthorized published", ok);

      // success
      return;
    } catch (e) {
      attempts++;
      console.error(`Error processing payment (attempt ${attempts}):`, err);

      if (attempts < maxRetries) {
          // Exponential backoff
          const delay = 1000 * Math.pow(2, attempts);
          await new Promise(res => setTimeout(res, delay));
        } else {
          console.error("Message permanently failed after retries:", evt);
        }
      }
    } // try
    } // while
  } // eachMsg
}); // cons.run()

// REST endpoint to fetch a payment by reservationId
app.get("/payments/:reservationId", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM payment WHERE reservation_id=?",
    [req.params.reservationId]
  );
  if (rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

// Start HTTP server
app.listen(3000, () => console.log("Payment service running on :3000"));
