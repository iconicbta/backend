const mongoose = require("mongoose");
const Cliente = require("./models/Cliente");
const Producto = require("./models/Producto");
const Entrenador = require("./models/Entrenador");
const Clase = require("./models/Clase");
const Membresia = require("./models/Membresia");

mongoose.connect("mongodb://localhost:27017/admin-gimnasios", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  await Cliente.deleteMany({});
  await Producto.deleteMany({});
  await Entrenador.deleteMany({});
  await Clase.deleteMany({});
  await Membresia.deleteMany({});

  await Cliente.insertMany([
    {
      nombre: "Juan Pérez",
      email: "juan@example.com",
      estado: "activo",
      membresiaActiva: true,
      membresiaFechaFin: new Date("2025-12-31"),
    },
    {
      nombre: "María López",
      email: "maria@example.com",
      estado: "inactivo",
      membresiaActiva: false,
    },
  ]);

  await Producto.insertMany([
    { nombre: "Proteína", cantidad: 10 },
    { nombre: "Guantes", cantidad: 5 },
  ]);

  await Entrenador.insertMany([{ nombre: "Carlos Gómez" }]);

  await Clase.insertMany([
    { nombre: "Yoga", estado: "activa" },
    { nombre: "Spinning", estado: "inactiva" },
  ]);

  await Membresia.insertMany([
    {
      clienteId: (await Cliente.findOne({ email: "juan@example.com" }))._id,
      estado: "activa",
      fechaFin: new Date("2025-05-07"),
    }, // Por vencer
    {
      clienteId: (await Cliente.findOne({ email: "maria@example.com" }))._id,
      estado: "activa",
      fechaFin: new Date("2025-12-31"),
    },
  ]);

  console.log("Datos insertados");
  mongoose.connection.close();
};

seedData().catch((err) => console.error(err));
