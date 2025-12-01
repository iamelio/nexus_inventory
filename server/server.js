const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./database");

const app = express();
const PORT = 5001;

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

app.use(cors());
app.use(express.json());

// --- Authentication ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";

  db.get(sql, [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        // In a real app, generate a JWT here. For simplicity/lightweight constraint, returning user info.
        const { password, ...userWithoutPass } = user;
        res.json({ user: userWithoutPass });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    });
  });
});

app.post("/api/register", (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!["Admin", "Staff"].includes(role)) {
    return res.status(400).json({ error: "Invalid role. Must be 'Admin' or 'Staff'" });
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) return res.status(500).json({ error: err.message });

    const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    db.run(sql, [username, hash, role], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ error: "Username already exists" });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "User registered successfully", userId: this.lastID });
    });
  });
});

// --- Inventory Management (Admin Only - Middleware skipped for simplicity but Role check implied in frontend) ---

// Get all products
app.get("/api/products", (req, res) => {
  const sql = "SELECT * FROM products";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ products: rows });
  });
});

// Add product
app.post("/api/products", (req, res) => {
  const { name, description, price, quantity, reorder_level, supplier } = req.body;
  // Basic validation
  if (price < 0 || quantity < 0) {
    return res.status(400).json({ error: "Price and Quantity must be non-negative" });
  }

  const sql = `INSERT INTO products (name, description, price, quantity, reorder_level, supplier)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [name, description, price, quantity, reorder_level, supplier];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, ...req.body });
  });
});

// Update product
app.put("/api/products/:id", (req, res) => {
  const { name, description, price, quantity, reorder_level, supplier } = req.body;
  if (price < 0 || quantity < 0) {
    return res.status(400).json({ error: "Price and Quantity must be non-negative" });
  }

  const sql = `UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, reorder_level = ?, supplier = ?
                 WHERE id = ?`;
  const params = [name, description, price, quantity, reorder_level, supplier, req.params.id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product updated", changes: this.changes });
  });
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  const sql = "DELETE FROM products WHERE id = ?";
  db.run(sql, req.params.id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Product deleted", changes: this.changes });
  });
});

// --- Sales Processing (Staff) ---

app.post("/api/sales", (req, res) => {
  const { product_id, quantity, sold_by } = req.body;

  if (quantity <= 0) return res.status(400).json({ error: "Quantity must be positive" });

  // Start Transaction
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Check Stock
    db.get(
      "SELECT price, quantity FROM products WHERE id = ?",
      [product_id],
      (err, product) => {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }
        if (!product) {
          db.run("ROLLBACK");
          return res.status(404).json({ error: "Product not found" });
        }
        if (product.quantity < quantity) {
          db.run("ROLLBACK");
          return res.status(400).json({ error: "Insufficient stock" });
        }

        const total_amount = product.price * quantity;
        const date = new Date().toISOString();

        // Deduct Stock
        db.run(
          "UPDATE products SET quantity = quantity - ? WHERE id = ?",
          [quantity, product_id],
          (err) => {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: err.message });
            }

            // Record Sale
            db.run(
              "INSERT INTO sales (product_id, quantity, total_amount, date, sold_by) VALUES (?, ?, ?, ?, ?)",
              [product_id, quantity, total_amount, date, sold_by],
              function (err) {
                if (err) {
                  db.run("ROLLBACK");
                  return res.status(500).json({ error: err.message });
                }

                db.run("COMMIT");
                res.json({
                  message: "Sale recorded successfully",
                  saleId: this.lastID,
                  total_amount,
                });
              }
            );
          }
        );
      }
    );
  });
});

// --- Dashboard Reporting ---

// Low Stock Alerts
app.get("/api/dashboard/low-stock", (req, res) => {
  const sql = "SELECT * FROM products WHERE quantity <= reorder_level";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ lowStockItems: rows });
  });
});

// Dashboard Stats (Total Inventory Value, Recent Sales)
app.get("/api/dashboard/stats", (req, res) => {
  const stats = {};

  // Total Inventory Value
  db.get("SELECT SUM(price * quantity) as totalValue FROM products", [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.totalInventoryValue = row.totalValue || 0;

    // Recent Sales (Last 5)
    const salesSql = `
            SELECT s.id, p.name as product_name, s.quantity, s.total_amount, s.date, u.username as sold_by
            FROM sales s
            JOIN products p ON s.product_id = p.id
            JOIN users u ON s.sold_by = u.id
            ORDER BY s.date DESC
            LIMIT 5
        `;
    db.all(salesSql, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.recentSales = rows;
      res.json(stats);
    });
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Keep process alive check - only if server started successfully
  setInterval(() => {
    // console.log('Heartbeat...');
  }, 10000);
});

server.on("error", (e) => {
  console.error("Server Error:", e);
  process.exit(1); // Exit if server can't start
});
