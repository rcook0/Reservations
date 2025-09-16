import express from "express";
import pool from "../db.js";
const router = express.Router();

// Reserve seat (simplified)
router.post("/", async (req, res) => {
  const { passenger_id, departure_date, airline_code, flight_number, seat_number } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check seat availability
    const [seatCheck] = await conn.query(
      "SELECT * FROM seat WHERE departure_date=? AND airline_code=? AND flight_number=? AND seat_number=? AND vacant='Y'",
      [departure_date, airline_code, flight_number, seat_number]
    );

    if (seatCheck.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).send("Seat not available");
    }

    // Reserve seat
    await conn.query(
      "INSERT INTO reserves (passenger_id, departure_date, airline_code, flight_number, seat_number) VALUES (?,?,?,?,?)",
      [passenger_id, departure_date, airline_code, flight_number, seat_number]
    );

    await conn.query(
      "UPDATE seat SET vacant='N' WHERE departure_date=? AND airline_code=? AND flight_number=? AND seat_number=?",
      [departure_date, airline_code, flight_number, seat_number]
    );

    await conn.commit();
    res.status(201).send("Reservation confirmed");
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).send("Reservation failed");
  } finally {
    conn.release();
  }
});

export default router;
