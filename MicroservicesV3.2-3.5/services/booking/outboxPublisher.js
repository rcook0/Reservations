import { Kafka } from "kafkajs";

export async function publishOutbox(db, kafka) {
  const producer = kafka.producer();
  await producer.connect();
  const [rows] = await db.query("SELECT * FROM outbox WHERE published=0");
  for (const row of rows) {
    await producer.send({
      topic: "payment.commands",
      messages: [{ key: String(row.id), value: row.payload }]
    });
    await db.query("UPDATE outbox SET published=1 WHERE id=?", [row.id]);
  }
  await producer.disconnect();
}
