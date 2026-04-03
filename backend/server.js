const express = require("express");
const cors = require("cors");
const db = require("./db");

const trainRoutes = require("./routes/trains");
const stationRoutes = require("./routes/stations");
const bookingRoutes = require("./routes/bookings");
const routeRoutes = require("./routes/routes");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/trains", trainRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚆 Railway API running on port ${PORT}`));