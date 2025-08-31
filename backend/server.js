require("dotenv").config();
console.log("Variables de entorno cargadas:", process.env.MONGODB_URI);

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { protect } = require("./middleware/authMiddleware");

// Función para depurar rutas
const debugRoutes = (prefix, router) => {
  console.log(`🔍 Depurando rutas para prefijo: ${prefix}`);
  if (router && router.stack) {
    router.stack.forEach((layer, index) => {
      if (layer.route) {
        console.log(`Ruta ${index + 1}: ${prefix}${layer.route.path}`);
      }
    });
  }
};

// Configuración de CORS
// Configuración de CORS
const allowedOrigins = [
  "https://frontendiconic.vercel.app",             // dominio principal en Vercel
  /^https:\/\/frontendiconic-[a-z0-9]+\.vercel\.app$/, // despliegues temporales de vercel
  "http://localhost:3000"                          // desarrollo local
];

const corsOptions = {
  origin: (origin, callback) => {
    console.log(`🔍 Origen recibido: ${origin}`);
    if (!origin) {
      // Permitir peticiones tipo curl / Postman / server-to-server sin origin
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.some(pattern =>
      typeof pattern === "string" ? pattern === origin : pattern.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⛔ Origen no permitido por CORS: ${origin}`);
      callback(new Error("No permitido por CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware de CORS
app.use(cors(corsOptions));

// Middleware especial para que OPTIONS responda OK
app.options("*", cors(corsOptions));


// Validar variables de entorno
if (!process.env.MONGODB_URI) {
  console.error("❌ Error: La variable de entorno MONGODB_URI no está definida. Verifica tu archivo .env o las variables en Render.");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("❌ Error: La variable de entorno JWT_SECRET no está definida. Verifica tu archivo .env o las variables en Render.");
  process.exit(1);
}

const app = express();

// Middleware de CORS
app.use(cors(corsOptions));

app.use(express.json());

// Middleware para registrar solicitudes
app.use((req, res, next) => {
  console.log(`📩 Solicitud recibida: ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Importar y registrar modelos
require("./models/User");
require("./models/Contabilidad");
require("./models/Entrenador");
require("./models/Cliente");
require("./models/RegistroClases");
require("./models/ComposicionCorporal");
require("./models/MedicionPorristas");

// Conectar a MongoDB con manejo de errores
console.log("Iniciando conexión a MongoDB...");
connectDB().catch((error) => {
  console.error("❌ Error al conectar a MongoDB:", error.message);
  process.exit(1);
});

// Importar rutas
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

// Middleware para rutas públicas y protegidas
app.use((req, res, next) => {
  if (req.path.startsWith("/api/composicion-corporal/cliente/") || req.path.startsWith("/api/auth")) {
    return next();
  }
  protect(req, res, next);
});

// Rutas con depuración
debugRoutes("/api/clientes", clienteRoutes);
app.use("/api/clientes", clienteRoutes);
debugRoutes("/api/membresias", membresiaRoutes);
app.use("/api/membresias", membresiaRoutes);
debugRoutes("/api/entrenadores", entrenadorRoutes);
app.use("/api/entrenadores", entrenadorRoutes);
debugRoutes("/api/productos", productRoutes);
app.use("/api/productos", productRoutes);
debugRoutes("/api/pagos", pagoRoutes);
app.use("/api/pagos", pagoRoutes);
debugRoutes("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
debugRoutes("/api/users", userRoutes);
app.use("/api/users", userRoutes);
debugRoutes("/api/clases", claseRoutes);
app.use("/api/clases", claseRoutes);
debugRoutes("/api/contabilidad", contabilidadRoutes);
app.use("/api/contabilidad", contabilidadRoutes);
debugRoutes("/api/indicadores", indicadorRoutes);
app.use("/api/indicadores", indicadorRoutes);
debugRoutes("/api/asistencias", asistenciaRoutes);
app.use("/api/asistencias", asistenciaRoutes);
debugRoutes("/api/rutinas", rutinaRoutes);
app.use("/api/rutinas", rutinaRoutes);
debugRoutes("/api/composicion-corporal", composicionCorporalRoutes);
app.use("/api/composicion-corporal", composicionCorporalRoutes);
debugRoutes("/api/medicion-porristas", medicionPorristasRoutes);
app.use("/api/medicion-porristas", medicionPorristasRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({ mensaje: "¡Servidor de Admin-Gimnasios funcionando correctamente!" });
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  if (req.url.startsWith("/api")) {
    console.log(`⚠️ Ruta no encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.url}` });
  } else {
    res.status(404).json({ mensaje: "Ruta no encontrada" });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("❌ Error en el servidor:", err.stack);
  res.status(500).json({
    mensaje: "Error interno del servidor",
    error: err.message || "Error desconocido",
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});


