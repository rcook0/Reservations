import express from "express";
import api from "../db/orm.js";
const router = express.Router();

router.get("/", async (_req, res) => {
  const rows = await api.listAirlines();
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).send("code and name required");
  await api.createAirline({ code, name });
  res.status(201).send("Airline created");
});

export default router;
