// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

// env + DB
dotenv.config();
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// APP (declare BEFORE using it)
const app = express();
app.use(cors());
app.use(express.json());

// --- API routes ---
app.get("/api/health", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW() AS now");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    console.error("HEALTH ERROR:", e);
    res.status(500).json({ ok: false, error: "DB not reachable" });
  }
});

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing data" });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  const existing = await pool.query("SELECT 1 FROM users WHERE email=$1", [email]);
  if (existing.rowCount > 0) return res.status(409).json({ error: "Email already registered" });

  const hash = await bcrypt.hash(password, 12);
  await pool.query("INSERT INTO users (email, password_hash) VALUES ($1, $2)", [email, hash]);
  res.status(201).json({ ok: true });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing data" });

  const r = await pool.query("SELECT password_hash FROM users WHERE email=$1", [email]);
  if (r.rowCount === 0) return res.status(404).json({ error: "User not found" });

  const ok = await bcrypt.compare(password, r.rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ ok: true });
});

// --- Static files (serve ../public) ---
app.use(express.static(path.join(__dirname, "..", "public")));

// Start
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`✅ API running at http://localhost:${port}`));
