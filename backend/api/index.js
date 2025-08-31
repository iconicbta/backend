const express = require("express");
const cors = require("cors");
const { MongoClient } = require("realm");
const router = require("./routes/index");

const app = express();

// Configura CORS para tu frontend con manejo de preflight
const corsOptions = {
  origin: "https://frontendporras-m7dzbit26-alfredos-projects-a028b04c.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204, // Respuesta correcta para OPTIONS
};

app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

// Conexión a MongoDB con Realm
const appId = process.env.REALM_APP_ID;
const apiKey = process.env.REALM_API_KEY;
const realmApp = new Realm.App({ id: appId });

async function connectToMongo() {
  try {
    const credentials = Realm.Credentials.apiKey(apiKey);
    const user = await realmApp.logIn(credentials);
    const client = user.mongoClient("mongodb-atlas");
    console.log("Conectado a MongoDB via Realm");
    return client.db("gimnasio_db");
  } catch (err) {
    console.error("Error de conexión a MongoDB:", err);
    throw err; // Propaga el error para manejarlo en el middleware
  }
}

// Middleware para inyectar la conexión
app.use(async (req, res, next) => {
  try {
    req.db = await connectToMongo();
    next();
  } catch (err) {
    res.status(500).json({ mensaje: "Error de conexión a la base de datos", detalle: err.message });
  }
});

// Monta las rutas (agrega un log para depuración)
console.log("Montando rutas en /api");
app.use("/api", router);

// Exporta la app para Vercel
module.exports = app;
