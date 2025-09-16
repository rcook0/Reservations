import express from "express";
import pool from "../db.js";
const router = express.Router();

// GET all airlines
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM airline");
  res.json(result.rows);
});

// POST new airline
router.post("/", async (req, res) => {
  const { code, name } = req.body;
  await pool.query("INSERT INTO airline (code, name) VALUES ($1, $2)", [code, name]);
  res.status(201).send("Airline created");
});

export default router;
