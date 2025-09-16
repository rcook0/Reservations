import express from "express";
import pool from "../db.js";
const router = express.Router();

// Reserve seat (simplified)
router.post("/", async (req, res) => {
  const { passenger_id, departure_date, airline_code, flight_number, seat_number } = req.body;

  try {
    await pool.query("BEGIN");

    // Check seat availability
    const seatCheck = await pool.query(
      "SELECT * FROM seat WHERE departure_date=$1 AND airline_code=$2 AND flight_number=$3 AND seat_number=$4 AND vacant='Y'",
      [departure_date, airline_code, flight_number, seat_number]
    );

    if (seatCheck.rowCount === 0) {
      await pool.query("ROLLBACK");
      return res.status(400).send("Seat not available");
    }

    // Reserve seat
    await pool.query(
      "INSERT INTO reserves (passenger_id, departure_date, airline_code, flight_number, seat_number) VALUES ($1,$2,$3,$4,$5)",
      [passenger_id, departure_date, airline_code, flight_number, seat_number]
    );

    await pool.query("UPDATE seat SET vacant='N' WHERE departure_date=$1 AND airline_code=$2 AND flight_number=$3 AND seat_number=$4",
      [departure_date, airline_code, flight_number, seat_number]);

    await pool.query("COMMIT");
    res.status(201).send("Reservation confirmed");
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    res.status(500).send("Reservation failed");
  }
});

export default router;
