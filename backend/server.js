require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { findRoutes } = require('./routes/routeFinder');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// ─── AUTH ──────────────────────────────────────────────────────────────────────
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    res.status(201).json({ message: 'User Created!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields are required' });
  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });
    res.json({ message: 'Login successful!', user: { id: user.user_id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── STATION AUTOCOMPLETE ──────────────────────────────────────────────────────
app.get('/api/stations/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  try {
    const term = `%${q.toUpperCase()}%`;
    const [rows] = await db.execute(
      `SELECT station_id, station_name, station_code FROM stations
       WHERE station_name LIKE ? OR station_code LIKE ? LIMIT 10`,
      [term, term]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TRAIN SEARCH ─────────────────────────────────────────────────────────────
app.get('/api/trains/search', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to station IDs required' });
  if (from === to) return res.status(400).json({ error: 'Source and destination must differ' });
  try {
    const results = await findRoutes(db, parseInt(from), parseInt(to));
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── TRAIN STOPS ──────────────────────────────────────────────────────────────
app.get('/api/trains/:trainNumber/stops', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ts.stop_order, s.station_name, s.station_code, ts.arrival_time, ts.departure_time
       FROM train_stops ts
       JOIN trains t ON t.train_id = ts.train_id
       JOIN stations s ON s.station_id = ts.station_id
       WHERE t.train_number = ?
       ORDER BY ts.stop_order`,
      [req.params.trainNumber]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
