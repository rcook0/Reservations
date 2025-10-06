import express from "express";
import proxy from "express-http-proxy";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

const app = express();
app.use(express.json());
app.use(morgan("combined"));

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const bookingUrl = process.env.BOOKING_URL || "http://localhost:4001";
const paymentUrl = process.env.PAYMENT_URL || "http://localhost:4002";

// Simple JWT auth
function auth(req, res, next) {
  if (req.method === "GET") return next(); // read-only open for demo
  const authz = req.headers.authorization || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// rate limit writes
const writeLimiter = rateLimit({ windowMs: 60_000, max: 60 });

app.use("/api/booking", auth, writeLimiter, proxy(bookingUrl, {
  proxyReqPathResolver: req => req.originalUrl.replace("/api/booking", ""),
}));

app.use("/api/payment", auth, writeLimiter, proxy(paymentUrl, {
  proxyReqPathResolver: req => req.originalUrl.replace("/api/payment", ""),
}));

//app.use("/api/reservations", proxy(bookingUrl));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(3000, () => console.log("Gateway on :3000"));
