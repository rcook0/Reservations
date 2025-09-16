import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "airline_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "password",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false
  }
);

const Airline = sequelize.define("airline", {
  code: { type: DataTypes.STRING(2), primaryKey: true },
  name: { type: DataTypes.STRING(50), allowNull: false }
}, { tableName: "airline", timestamps: false });

const Flight = sequelize.define("flight", {
  flight_number: { type: DataTypes.INTEGER, primaryKey: true },
  airline_code: { type: DataTypes.STRING(2), allowNull: false },
  aircraft: { type: DataTypes.STRING(20) },
  departure_airport: { type: DataTypes.STRING(3) },
  arrival_airport: { type: DataTypes.STRING(3) },
  mileage: { type: DataTypes.INTEGER }
}, { tableName: "flight", timestamps: false });

const Passenger = sequelize.define("passenger", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  forename: { type: DataTypes.STRING(12) },
  surname: { type: DataTypes.STRING(12) }
}, { tableName: "passenger", timestamps: false });

const Seat = sequelize.define("seat", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  departure_date: { type: DataTypes.DATEONLY, allowNull: false },
  seat_number: { type: DataTypes.STRING(3), allowNull: false },
  vacant: { type: DataTypes.BOOLEAN, defaultValue: true },
  flight_number: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: "seat", timestamps: false });

const Reserve = sequelize.define("reserve", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  passenger_id: { type: DataTypes.INTEGER, allowNull: false },
  seat_id: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: "reserve", timestamps: false });

Flight.belongsTo(Airline, { foreignKey: "airline_code", targetKey: "code" });
Seat.belongsTo(Flight, { foreignKey: "flight_number", targetKey: "flight_number" });
Reserve.belongsTo(Passenger, { foreignKey: "passenger_id" });
Reserve.belongsTo(Seat, { foreignKey: "seat_id" });

export { sequelize, Airline, Flight, Passenger, Seat, Reserve };
export const models = { Airline, Flight, Passenger, Seat, Reserve };
