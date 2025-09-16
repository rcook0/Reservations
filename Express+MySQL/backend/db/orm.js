import prismaClient from "./prismaClient.js";
import { sequelize, models } from "./sequelize.js";

const ORM = (process.env.ORM || "prisma").toLowerCase();

// Prisma
const prismaAPI = {
  async listAirlines() { return prismaClient.airline.findMany(); },
  async createAirline({ code, name }) { return prismaClient.airline.create({ data: { code, name } }); },
  async listFlights() { return prismaClient.flight.findMany(); },
  async createFlight(data) { return prismaClient.flight.create({ data }); },
  async createReservation({ passenger_id, departure_date, flight_number, seat_number }) {
    const seat = await prismaClient.seat.findFirst({
      where: { flight_number, departure_date: new Date(departure_date), seat_number, vacant: true }
    });
    if (!seat) throw new Error("Seat not available");
    return await prismaClient.$transaction(async tx => {
      await tx.reserve.create({ data: { passenger_id, seat_id: seat.id } });
      await tx.seat.update({ where: { id: seat.id }, data: { vacant: false } });
      return { ok: true };
    });
  }
};

// Sequelize
const seqAPI = {
  async listAirlines() { return models.Airline.findAll({ raw: true }); },
  async createAirline({ code, name }) { return models.Airline.create({ code, name }); },
  async listFlights() { return models.Flight.findAll({ raw: true }); },
  async createFlight(data) { return models.Flight.create(data); },
  async createReservation({ passenger_id, departure_date, flight_number, seat_number }) {
    const t = await sequelize.transaction();
    try {
      const seat = await models.Seat.findOne({
        where: { flight_number, departure_date, seat_number, vacant: true },
        transaction: t
      });
      if (!seat) { await t.rollback(); throw new Error("Seat not available"); }
      await models.Reserve.create({ passenger_id, seat_id: seat.id }, { transaction: t });
      await seat.update({ vacant: false }, { transaction: t });
      await t.commit();
      return { ok: true };
    } catch (e) {
      try { await t.rollback(); } catch {}
      throw e;
    }
  }
};

const api = ORM === "sequelize" ? seqAPI : prismaAPI;
export default api;
