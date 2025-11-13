// backend/api/index.js
const express = require("express");
const cors = require("cors");
const Realm = require("realm-web"); // ✅ Correcta importación
const router = require("../routes/index"); // ✅ Asegúrate de la ruta correcta

const app = express();

/* ======================================================
   ✅ CORS — versión funcional para Vercel
====================================================== */
const allowedOrigins = [
  "https://frontendiconic.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    res.header("Access-Control-Allow-Credentials", "true");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // ✅ Preflight OK
  }

  next();
});

/* ======================================================
   ✅ Middlewares base
====================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ======================================================
   ✅ Conexión a MongoDB vía Realm
====================================================== */
const appId = process.env.REALM_APP_ID;
const apiKey = process.env.REALM_API_KEY;

if (!appId || !apiKey) {
  console.error("❌ Faltan variables de entorno: REALM_APP_ID o REALM_API_KEY");
}

const realmApp = new Realm.App({ id: appId });
let cachedClient = null;

async function connectToMongo() {
  if (cachedClient) return cachedClient;

  try {
    const credentials = Realm.Credentials.apiKey(apiKey);
    const user = await realmApp.logIn(credentials);
    cachedClient = user.mongoClient("mongodb-atlas").db("gimnasio_db");
    console.log("✅ Conectado a MongoDB via Realm");
    return cachedClient;
  } catch (err) {
    console.error("❌ Error de conexión a MongoDB:", err.message);
    throw err;
  }
}

// Middleware global para inyectar conexión
app.use(async (req, res, next) => {
  try {
    req.db = await connectToMongo();
    next();
  } catch (err) {
    res
      .status(500)
      .json({ mensaje: "Error de conexión a la base de datos", detalle: err.message });
  }
});

/* ======================================================
   ✅ Rutas API
====================================================== */
console.log("📦 Montando rutas en /api");
app.use("/api", router);

/* ======================================================
   ✅ Ruta base para prueba
====================================================== */
app.get("/", (req, res) => {
  res.json({ mensaje: "💪 Backend Iconic operativo con CORS habilitado" });
});

/* ======================================================
   ✅ Exportar para Vercel (sin app.listen)
====================================================== */
module.exports = app;
