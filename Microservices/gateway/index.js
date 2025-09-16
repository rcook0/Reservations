import express from "express";
import proxy from "express-http-proxy";

const app = express();
const bookingUrl = process.env.BOOKING_URL || "http://localhost:4001";

app.use("/api/reservations", proxy(bookingUrl));

app.listen(3000, () => console.log("API Gateway on :3000"));
