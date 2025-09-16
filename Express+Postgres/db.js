import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "airline_db",
  password: "password",
  port: 5432,
});

export default pool;
