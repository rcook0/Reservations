import express from "express";
import { Kafka } from "kafkajs";
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import avro from "avsc";
import fs from "fs";

const app = express();
app.get("/health", (_req, res) => res.json({ ok: true }));

const kafka = new Kafka({ brokers: process.env.KAFKA_BROKERS.split(",") });
const consumer = kafka.consumer({ groupId: "notification-service" });

const registryUrl = process.env.SCHEMA_REGISTRY_URL;
let registry = null;
if (registryUrl) registry = new SchemaRegistry({ host: registryUrl });

const tPassenger = avro.Type.forSchema(JSON.parse(fs.readFileSync(new URL("../../contracts/passenger-created.avsc", import.meta.url))));

function decode(value) {
  if (registry) { try { return registry.decode(value); } catch {} }
  return tPassenger.fromBuffer(value);
}

await consumer.connect();
await consumer.subscribe({ topic: "passenger.events", fromBeginning: true });

consumer.run({
  eachMessage: async ({ message }) => {
    const evt = decode(message.value);
    console.log("Notification: welcome email queued for", evt.forename, evt.surname, "(id:", evt.id + ")");
  }
});

app.listen(3000, () => console.log("Notification service on :3000"));
