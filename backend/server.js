require('dotenv').config();

const express  = require('express');
const mysql    = require('mysql2/promise');
const bcrypt   = require('bcrypt');
const cors     = require('cors');
const jwt      = require('jsonwebtoken');
const Redis    = require('ioredis');
const { findRoutes } = require('./routes/routeFinder');

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB ───────────────────────────────────────────────────────────────────────
const db = mysql.createPool({
  host    : process.env.DB_HOST,
  user    : process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ─── REDIS ────────────────────────────────────────────────────────────────────
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error',   (e) => console.error('Redis error:', e.message));

const CACHE_TTL = 300; // 5 minutes in seconds

// ─── JWT MIDDLEWARE ───────────────────────────────────────────────────────────
// Attach this to any route that requires login
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
// Catches any unhandled errors thrown in routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: 'User Created!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    if (users.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user    = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid email or password' });

    // ── sign JWT ──────────────────────────────────────────────────────────────
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,                                          // ← frontend saves this
      user: { id: user.user_id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── STATION AUTOCOMPLETE (public) ───────────────────────────────────────────
app.get('/api/stations/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  try {
    const term    = `%${q.toUpperCase()}%`;
    const cacheKey = `stations:${q.toUpperCase()}`;

    // check cache first
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const [rows] = await db.execute(
      `SELECT station_id, station_name, station_code FROM stations
       WHERE station_name LIKE ? OR station_code LIKE ? LIMIT 10`,
      [term, term]
    );

    // cache station results for 1 hour (they never change)
    await redis.setex(cacheKey, 3600, JSON.stringify(rows));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Something went wrong' });
});

// ─── TRAIN SEARCH with Redis caching (public) ─────────────────────────────────
app.get('/api/trains/search', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to)
    return res.status(400).json({ error: 'from and to station IDs required' });
  if (from === to)
    return res.status(400).json({ error: 'Source and destination must differ' });

  const cacheKey = `search:${from}:${to}`;

  try {
    // ── cache hit → return instantly ─────────────────────────────────────────
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`Cache HIT  ${cacheKey}`);
      return res.json(JSON.parse(cached));
    }

    // ── cache miss → run Yen's algorithm ─────────────────────────────────────
    console.log(`Cache MISS ${cacheKey} — running Yen's...`);
    const start   = Date.now();
    const results = await findRoutes(db, parseInt(from), parseInt(to));
    console.log(`Yen's took ${Date.now() - start}ms`);   // ← measure this for resume

    // store in Redis for 5 minutes
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(results));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── TRAIN STOPS (public) ────────────────────────────────────────────────────
app.get('/api/trains/:trainNumber/stops', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ts.stop_order, s.station_name, s.station_code,
              ts.arrival_time, ts.departure_time
       FROM train_stops ts
       JOIN trains   t ON t.train_id    = ts.train_id
       JOIN stations s ON s.station_id  = ts.station_id
       WHERE t.train_number = ?
       ORDER BY ts.stop_order`,
      [req.params.trainNumber]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── BOOKINGS (protected — JWT required) ─────────────────────────────────────

// Create booking
app.post('/api/bookings', authenticate, async (req, res) => {
  const { train_id, from_station, to_station, journey_date, travel_class, passengers } = req.body;
  const user_id = req.user.userId;

  if (!train_id || !from_station || !to_station || !journey_date || !passengers?.length)
    return res.status(400).json({ error: 'Missing required booking fields' });

  try {
    // generate a random PNR (10 chars alphanumeric)
    const pnr = Math.random().toString(36).substring(2, 12).toUpperCase();

    const [result] = await db.execute(
      `INSERT INTO bookings
        (user_id, train_id, from_station, to_station, journey_date, class, passengers, pnr, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'CNF')`,
      [user_id, train_id, from_station, to_station, journey_date,
       travel_class, JSON.stringify(passengers), pnr]
    );

    // invalidate the route cache for this pair so availability is fresh
    await redis.del(`search:${from_station}:${to_station}`);

    res.status(201).json({
      message   : 'Booking confirmed!',
      booking_id: result.insertId,
      pnr,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all bookings for logged-in user
app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT b.*, t.train_name, t.train_number,
              s1.station_name AS from_name,
              s2.station_name AS to_name
       FROM bookings b
       JOIN trains   t  ON t.train_id    = b.train_id
       JOIN stations s1 ON s1.station_id = b.from_station
       JOIN stations s2 ON s2.station_id = b.to_station
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel booking
app.patch('/api/bookings/:id/cancel', authenticate, async (req, res) => {
  try {
    // only let user cancel their own booking
    const [rows] = await db.execute(
      'SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Booking not found' });
    if (rows[0].status === 'CANCELLED')
      return res.status(400).json({ error: 'Already cancelled' });

    await db.execute(
      "UPDATE bookings SET status = 'CANCELLED' WHERE booking_id = ?",
      [req.params.id]
    );
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));