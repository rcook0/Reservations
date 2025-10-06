import { Kafka } from "kafkajs";
import mysql from "mysql2/promise";

export async function startPaymentConsumer() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const kafka = new Kafka({ brokers: process.env.KAFKA_BROKERS.split(",") });
  const consumer = kafka.consumer({ groupId: "booking-service" });

  await consumer.connect();
  await consumer.subscribe({ topic: "payment.events", fromBeginning: true });

  consumer.run({
    eachMessage: async ({ message }) => {
      const evt = JSON.parse(message.value.toString());
      console.log("Booking received payment event", evt);
      let attempts = 0;
      const maxRetries = 3;
      while (attempts < maxRetries) {
        try {
          if (evt.type === "PaymentAuthorized") {
            await db.query("UPDATE reservation SET status='CONFIRMED' WHERE id=?", [evt.reservationId]);
          } else if (evt.type === "PaymentFailed") {
            await db.query("UPDATE reservation SET status='FAILED' WHERE id=?", [evt.reservationId]);
          }
          return;
        } catch (err) {
          attempts++;
          console.error(`Error updating reservation (attempt ${attempts}):`, err);
          if (attempts < maxRetries) {
            const delay = 1000 * Math.pow(2, attempts);
            await new Promise(res => setTimeout(res, delay));
          } else {
            console.error("Reservation update permanently failed:", evt);
          }
        }
      }
    }
  });
}
