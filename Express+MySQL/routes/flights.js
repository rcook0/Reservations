import express from "express";
import pool from "../db.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM flight");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { airline_code, flight_number, aircraft, departure_airport, arrival_airport, mileage } = req.body;
  await pool.query(
    "INSERT INTO flight (airline_code, flight_number, aircraft, departure_airport, arrival_airport, mileage) VALUES (?,?,?,?,?,?)",
    [airline_code, flight_number, aircraft, departure_airport, arrival_airport, mileage]
  );
  res.status(201).send("Flight created");
});

export default router;
