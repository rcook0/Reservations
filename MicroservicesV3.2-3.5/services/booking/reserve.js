import { withTx } from "../util/db.js";
import { publishOutbox } from "../workers/outboxPublisher.js";

export async function initiateReservation(db, kafka, cmd) {
  const { passenger_id, flight_number, departure_date, seat_number, amount, currency } = cmd;
  await withTx(db, async (conn) => {
    const [seat] = await conn.query(
      "SELECT id,vacant FROM seat WHERE flight_number=? AND departure_date=? AND seat_number=? FOR UPDATE",
      [flight_number, departure_date, seat_number]
    );
    if (!seat.length || !seat[0].vacant) throw new Error("Seat not available");

    await conn.query("UPDATE seat SET vacant=0 WHERE id=?", [seat[0].id]);

    const [res] = await conn.query(
      "INSERT INTO reservation(passenger_id,flight_number,departure_date,seat_number,status,amount,currency) VALUES (?,?,?,?, 'PENDING',?,?)",
      [passenger_id, flight_number, departure_date, seat_number, amount, currency]
    );
    const reservationId = res.insertId;

    const payload = {
      type: "PaymentAuthorizeRequested",
      version: 1,
      correlationId: crypto.randomUUID(),
      reservationId, amount, currency,
      paymentMethod: { kind: "card", token: cmd.cardToken }
    };

    await conn.query(
      "INSERT INTO outbox(aggregate_type,aggregate_id,type,payload) VALUES (?,?,?,?)",
      ["reservation", String(reservationId), "payment.commands", JSON.stringify(payload)]
    );
  });

  // publisher worker reads outbox and publishes to Kafka
  await publishOutbox(db, kafka);
}
