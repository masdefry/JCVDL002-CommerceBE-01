const mysql = require("mysql");

require("dotenv").config();

// Connection
const db = mysql.createConnection({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

module.exports = db;
