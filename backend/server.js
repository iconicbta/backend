// backend/server.js
require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/db");
const { protect } = require("./middleware/authMiddleware");

const app = express();

/* ======================================================
   🔹 CORS - versión para debug y compatibilidad total Vercel
====================================================== */
const allowedOrigins = [
  "https://frontendiconic.vercel.app",
  /^https:\/\/frontendiconic.*\.vercel\.app$/, // previews
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log("🛰️ CORS Debug → Origin recibido:", origin, "Método:", req.method);

  // Revisar si está permitido
  const isAllowed = allowedOrigins.some((pattern) =>
    typeof pattern === "string" ? pattern === origin : pattern.test(origin)
  );

  // Enviar SIEMPRE headers CORS
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  if (isAllowed && origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    console.log("✅ CORS permitido para:", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
    console.log("⚠️ CORS abierto (fallback *).");
  }

  if (req.method === "OPTIONS") {
    console.log("🟢 Preflight respondido OK desde:", origin);
    return res.sendStatus(200);
  }

  next();
});

/* ======================================================
   ✅ Seguridad y límites
====================================================== */
app.set("trust proxy", true);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ======================================================
   🔹 Logger de rutas
====================================================== */
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

/* ======================================================
   🔹 Conexión MongoDB
====================================================== */
connectDB()
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => {
    console.error("❌ Error MongoDB:", err.message);
    process.exit(1);
  });

/* ======================================================
   🔹 Rutas
====================================================== */
const clienteRoutes = require("./routes/clienteRoutes");
const membresiaRoutes = require("./routes/membresiaRoutes");
const entrenadorRoutes = require("./routes/entrenadorRoutes");
const productRoutes = require("./routes/productRoutes");
const pagoRoutes = require("./routes/pagoRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const claseRoutes = require("./routes/claseRoutes");
const contabilidadRoutes = require("./routes/contabilidad");
const indicadorRoutes = require("./routes/indicadorRoutes");
const asistenciaRoutes = require("./routes/asistenciaRoutes");
const rutinaRoutes = require("./routes/rutinas");
const composicionCorporalRoutes = require("./routes/composicionCorporal");
const medicionPorristasRoutes = require("./routes/medicionPorristas");
const especialidadesRoutes = require("./routes/especialidades");
const pagosLigasRoutes = require("./routes/pagosLigasRoutes");

// Rutas públicas
app.use("/api/auth", authRoutes);
app.use("/api/especialidades", especialidadesRoutes);
app.use("/api/composicion-corporal", composicionCorporalRoutes);

// Privadas
app.use("/api/clientes", protect, clienteRoutes);
app.use("/api/membresias", protect, membresiaRoutes);
app.use("/api/entrenadores", protect, entrenadorRoutes);
app.use("/api/productos", protect, productRoutes);
app.use("/api/pagos", protect, pagoRoutes);
app.use("/api/users", protect, userRoutes);
app.use("/api/clases", protect, claseRoutes);
app.use("/api/contabilidad", protect, contabilidadRoutes);
app.use("/api/indicadores", protect, indicadorRoutes);
app.use("/api/asistencias", protect, asistenciaRoutes);
app.use("/api/rutinas", protect, rutinaRoutes);
app.use("/api/medicion-porristas", protect, medicionPorristasRoutes);

// Temporalmente sin protección
app.use("/api/pagos-ligas", pagosLigasRoutes);

/* ======================================================
   🔹 Health Check
====================================================== */
app.get("/", (req, res) => {
  res.json({ mensaje: "💪 Backend Iconic OK" });
});

/* ======================================================
   🔹 Errores
====================================================== */
app.use((req, res, next) => {
  if (req.url.startsWith("/api")) {
    console.log(`⚠️ Ruta no encontrada: ${req.method} ${req.url}`);
    return res.status(404).json({
      mensaje: `Ruta no encontrada: ${req.method} ${req.url}`,
    });
  }
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error("❌ Error global:", err.stack || err);
  res.status(500).json({
    mensaje: "Error interno del servidor",
    error: err.message || "Error desconocido",
  });
});

/* ======================================================
   🔹 Arranque
====================================================== */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} - ENV: ${process.env.NODE_ENV}`)
);
