import express from "express";
import api from "../db/orm.js";
const router = express.Router();

router.get("/", async (_req, res) => {
  const rows = await api.listFlights();
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { airline_code, flight_number, aircraft, departure_airport, arrival_airport, mileage } = req.body;
  if (!airline_code || !flight_number) return res.status(400).send("airline_code and flight_number required");
  await api.createFlight({ airline_code, flight_number, aircraft, departure_airport, arrival_airport, mileage });
  res.status(201).send("Flight created");
});

export default router;
