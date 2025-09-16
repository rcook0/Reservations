import express from "express";
import api from "../db/orm.js";
const router = express.Router();

router.post("/", async (req, res) => {
  const { passenger_id, departure_date, airline_code, flight_number, seat_number } = req.body;
  try {
    await api.createReservation({ passenger_id, departure_date, flight_number, seat_number, airline_code });
    res.status(201).send("Reservation confirmed ✅");
  } catch (e) {
    if ((e.message || "").toLowerCase().includes("not available"))
      return res.status(400).send("Seat not available ❌");
    console.error(e);
    res.status(500).send("Reservation failed");
  }
});

export default router;
