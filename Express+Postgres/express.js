import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import airlinesRouter from "./routes/airlines.js";
import flightsRouter from "./routes/flights.js";
import reservationsRouter from "./routes/reservations.js";

const app = express();
app.use(bodyParser.json());
app.use(morgan("dev")); // logging middleware

app.use("/api/airlines", airlinesRouter);
app.use("/api/flights", flightsRouter);
app.use("/api/reservations", reservationsRouter);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
