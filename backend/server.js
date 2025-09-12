require("dotenv").config();
console.log("Variables de entorno cargadas:", process.env.MONGODB_URI);

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { protect } = require("./middleware/authMiddleware");

const app = express();

// ================================
// 🔹 Configuración de CORS
// ================================
const allowedOrigins = [
  "https://frontendiconic.vercel.app",
  /^https:\/\/frontendiconic.*\.vercel\.app$/, // subdominios
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    console.log(`🔍 Origen recibido: ${origin}`);
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some((pattern) =>
      typeof pattern === "string" ? pattern === origin : pattern.test(origin)
    );
    if (isAllowed) callback(null, true);
    else callback(new Error("No permitido por CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// ================================
// 🔹 Middleware de log de solicitudes
// ================================
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// ================================
// 🔹 Conectar a MongoDB
// ================================
console.log("Iniciando conexión a MongoDB...");
connectDB()
  .then(() => console.log("✅ Conexión a MongoDB establecida"))
  .catch((error) => {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    process.exit(1);
  });

// ================================
// 🔹 Importar Rutas
// ================================
const clienteRoutes            = require("./routes/clienteRoutes");
const membresiaRoutes          = require("./routes/membresiaRoutes");
const entrenadorRoutes         = require("./routes/entrenadorRoutes");
const productRoutes            = require("./routes/productRoutes");
const pagoRoutes               = require("./routes/pagoRoutes");
const authRoutes               = require("./routes/authRoutes");
const userRoutes               = require("./routes/userRoutes");
const claseRoutes              = require("./routes/claseRoutes");
const contabilidadRoutes       = require("./routes/contabilidad");
const indicadorRoutes          = require("./routes/indicadorRoutes");
const asistenciaRoutes         = require("./routes/asistenciaRoutes");
const rutinaRoutes             = require("./routes/rutinas");
const composicionCorporalRoutes= require("./routes/composicionCorporal");
const medicionPorristasRoutes  = require("./routes/medicionPorristas"); // 👈 corregido
const especialidadesRoutes     = require("./routes/especialidades");

// ================================
// 🔹 Registrar Rutas
// ================================
// Públicas
app.use("/api/auth", authRoutes);
app.use("/api/especialidades", especialidadesRoutes); 
app.use("/api/composicion-corporal", composicionCorporalRoutes); 

// Privadas (requieren login con token)
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

// ================================
// 🔹 Ruta raíz pública
// ================================
app.get("/", (req, res) => {
  res.json({ mensaje: "¡Servidor de Admin-Gimnasios funcionando correctamente!" });
});

// ================================
// 🔹 Manejo de errores
// ================================
app.use((req, res) => {
  if (req.url.startsWith("/api")) {
    console.log(`⚠️ Ruta no encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.url}` });
  } else {
    res.status(404).json({ mensaje: "Ruta no encontrada" });
  }
});

app.use((err, req, res, next) => {
  console.error("❌ Error en el servidor:", err.stack);
  res.status(500).json({
    mensaje: "Error interno del servidor",
    error: err.message || "Error desconocido",
  });
});

// ================================
// 🔹 Iniciar servidor
// ================================
const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
