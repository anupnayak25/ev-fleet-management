const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");

// Load env from project root .env if present
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routers
const authRouter = require("./src/routes/auth");
const fleetRouter = require("./src/routes/fleets");
const vehicleRouter = require("./src/routes/vehicles");
const sessionRouter = require("./src/routes/sessions");

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "EV Fleet Management API running" });
});

app.use("/api/auth", authRouter);
app.use("/api/fleets", fleetRouter);
app.use("/api/vehicles", vehicleRouter);
app.use("/api/sessions", sessionRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
