import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "kipsreality",
});

// Get all
app.get("/api/brandPromise", (req, res) => {
  db.query("SELECT * FROM brand_promises", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Create
app.post("/api/brandPromise", (req, res) => {
  const { title, content, highlight_color } = req.body;
  db.query(
    "INSERT INTO brand_promises (title, content, highlight_color) VALUES (?, ?, ?)",
    [title, content, highlight_color],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ title, content, highlight_color });
    }
  );
});

// Update
app.put("/api/brandPromise/:id", (req, res) => {
  const { id } = req.params;
  const { title, content, highlight_color } = req.body;
  db.query(
    "UPDATE brand_promises SET title=?, content=?, highlight_color=? WHERE id=?",
    [title, content, highlight_color, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ id, title, content, highlight_color });
    }
  );
});

// Delete
app.delete("/api/brandPromise/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM brand_promises WHERE id=?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Deleted successfully" });
  });
});

app.listen(4000, () => console.log("API running on port 4000"));
