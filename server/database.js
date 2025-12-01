const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");

const dbPath = path.resolve(__dirname, "nexus.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database " + dbPath + ": " + err.message);
  } else {
    console.log("Connected to the SQLite database.");
    initTables();
  }
});

function initTables() {
  db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT CHECK(role IN ('Admin', 'Staff'))
        )`);

    // Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            price REAL CHECK(price >= 0),
            quantity INTEGER CHECK(quantity >= 0),
            reorder_level INTEGER,
            supplier TEXT
        )`);

    // Sales Table
    db.run(`CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER,
            quantity INTEGER,
            total_amount REAL,
            date TEXT,
            sold_by INTEGER,
            FOREIGN KEY(product_id) REFERENCES products(id),
            FOREIGN KEY(sold_by) REFERENCES users(id)
        )`);

    // Seed Users if empty
    db.get("SELECT count(*) as count FROM users", [], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row.count === 0) {
        const saltRounds = 10;
        const adminPass = "admin123"; // Default admin password
        const staffPass = "staff123"; // Default staff password

        bcrypt.hash(adminPass, saltRounds, (err, hash) => {
          if (err) return console.error(err);
          db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
            "admin",
            hash,
            "Admin",
          ]);
          console.log("Default Admin user created.");
        });

        bcrypt.hash(staffPass, saltRounds, (err, hash) => {
          if (err) return console.error(err);
          db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
            "staff",
            hash,
            "Staff",
          ]);
          console.log("Default Staff user created.");
        });
      }
    });
  });
}

module.exports = db;
