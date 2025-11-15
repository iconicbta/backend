// backend/server.js
require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/db");
const { protect } = require("./middleware/authMiddleware");

const app = express();

/* ======================================================
   🔹 CORS GLOBAL - TOTALMENTE COMPATIBLE CON VERCEL
====================================================== */
const allowedOrigins = [
  "https://frontendiconic.vercel.app",
  /^https:\/\/frontendiconic.*\.vercel\.app$/,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  const isAllowed = allowedOrigins.some((pattern) =>
    typeof pattern === "string" ? pattern === origin : pattern.test(origin)
  );

  if (isAllowed) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ======================================================
   Seguridad y límites
====================================================== */
app.set("trust proxy", true);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ======================================================
   Logger
====================================================== */
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url}`);
  next();
});

/* ======================================================
   Conexión MongoDB
====================================================== */
connectDB();

/* ======================================================
   Rutas
====================================================== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/especialidades", require("./routes/especialidades"));
app.use("/api/composicion-corporal", require("./routes/composicionCorporal"));

// PRIVADAS
app.use("/api/clientes", protect, require("./routes/clienteRoutes"));
app.use("/api/membresias", protect, require("./routes/membresiaRoutes"));
app.use("/api/entrenadores", protect, require("./routes/entrenadorRoutes"));
app.use("/api/productos", protect, require("./routes/productRoutes"));
app.use("/api/pagos", protect, require("./routes/pagoRoutes"));
app.use("/api/users", protect, require("./routes/userRoutes"));
app.use("/api/clases", protect, require("./routes/claseRoutes"));
app.use("/api/contabilidad", protect, require("./routes/contabilidad"));
app.use("/api/indicadores", protect, require("./routes/indicadorRoutes"));
app.use("/api/asistencias", protect, require("./routes/asistenciaRoutes"));
app.use("/api/rutinas", protect, require("./routes/rutinas"));
app.use("/api/medicion-porristas", protect, require("./routes/medicionPorristas"));

// Temporalmente sin protección
app.use("/api/pagos-ligas", require("./routes/pagosLigasRoutes"));

/* ======================================================
   Health Check
====================================================== */
app.get("/", (req, res) => {
  res.json({ mensaje: "💪 Backend Iconic OK" });
});

/* ======================================================
   Manejo de errores
====================================================== */
app.use((req, res) => {
  return res.status(404).json({
    mensaje: `Ruta no encontrada: ${req.method} ${req.url}`,
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Error global:", err);
  return res.status(500).json({
    mensaje: "Error interno del servidor",
    error: err.message,
  });
});

/* ======================================================
   🚫 NO USAR app.listen() EN VERCEL
   EXPORTAR EL HANDLER
====================================================== */
module.exports = app;

