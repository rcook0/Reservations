import express from "express";
import mysql from "mysql2/promise";
import { Kafka } from "kafkajs";

const app = express();
app.use(express.json());

const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const kafka = new Kafka({ brokers: process.env.KAFKA_BROKERS.split(",") });
const consumer = kafka.consumer({ groupId: "payment-service" });
const producer = kafka.producer();

await consumer.connect();
await producer.connect();
await consumer.subscribe({ topic: "payment.commands", fromBeginning: true });

consumer.run({
  eachMessage: async ({ message }) => {
    const evt = JSON.parse(message.value.toString());
    console.log("Processing payment event", evt);

    await db.query("INSERT INTO payment (reservation_id, status, amount, currency) VALUES (?,?,?,?)",
      [evt.reservationId, "AUTHORIZED", evt.amount, evt.currency]);

    await producer.send({
      topic: "payment.events",
      messages: [{ value: JSON.stringify({ type: "PaymentAuthorized", reservationId: evt.reservationId }) }]
    });
  }
});

// REST endpoint to fetch a payment by reservationId
app.get("/payments/:reservationId", async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM payment WHERE reservation_id=?",
    [req.params.reservationId]
  );
  if (rows.length === 0) return res.status(404).send({ error: "Not found" });
  res.json(rows[0]);
});

app.listen(3000, () => console.log("Payment service running on :3000"));


