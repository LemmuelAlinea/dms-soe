const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
// CORS - SIMPLE PRODUCTION SAFE VERSION
app.use(cors({
  origin: true,
  credentials: true
}));
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ===========================
   ✅ PROPER PRODUCTION CORS
=========================== */

const allowedOrigins = [
  "http://localhost:5173",
  "https://dms-soe.vercel.app"  // ← IMPORTANT: your Vercel URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser tools

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// app.use(limiter);
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("DMS Backend Running");
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/departments", require("./routes/departments.routes"));
app.use("/api/admins", require("./routes/admins.routes"));
app.use("/api/folders", require("./routes/folders.routes"));
app.use("/api/documents", require("./routes/documents.routes"));
app.use("/api/analytics", require("./routes/analytics.routes"));
app.use("/api/logs", require("./routes/logs.routes"));
app.use("/api/superadmin", require("./routes/superadmin.routes"));

app.use(require("./middleware/error.middleware"));

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});