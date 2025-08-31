const express = require("express");
const router = express.Router();
const Cliente = require("../models/Cliente");
const Producto = require("../models/Producto");
const Entrenador = require("../models/Entrenador");
const Clase = require("../models/Clase");
const Membresia = require("../models/Membresia");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    // Clientes Activos (considerando "No especificado" como activo temporalmente)
    const clientesActivos = await Cliente.countDocuments({
      $or: [{ estado: "activo" }, { estado: "No especificado" }],
    });
    console.log("Clientes Activos:", clientesActivos);

    // Clientes Inactivos
    const clientesInactivos = await Cliente.countDocuments({
      estado: "inactivo",
    });
    console.log("Clientes Inactivos:", clientesInactivos);

    // Total de Productos
    const totalProductos = await Producto.countDocuments();
    console.log("Total Productos:", totalProductos);

    // Existencias Totales
    const productos = await Producto.find();
    const existenciasTotales = productos.reduce(
      (total, producto) => total + (producto.cantidad || 0),
      0
    );
    console.log("Existencias Totales:", existenciasTotales);

    // Entrenadores
    const entrenadores = await Entrenador.countDocuments();
    console.log("Entrenadores:", entrenadores);

    // Clases Activas
    const clasesActivas = await Clase.countDocuments({ estado: "activa" });
    console.log("Clases Activas:", clasesActivas);

    // Membresías Activas
    const membresiasActivas = await Membresia.countDocuments({
      estado: "activa",
    });
    console.log("Membresías Activas:", membresiasActivas);

    // Membresías por Vencer (en 5 días)
    const hoy = new Date();
    const cincoDiasDespues = new Date(hoy);
    cincoDiasDespues.setDate(hoy.getDate() + 5);
    const membresiasPorVencer = await Membresia.countDocuments({
      estado: "activa",
      fechaFin: { $exists: true, $gte: hoy, $lte: cincoDiasDespues },
    });
    console.log("Membresías por Vencer:", membresiasPorVencer);

    const indicadores = {
      clientesActivos,
      clientesInactivos,
      totalProductos,
      existenciasTotales,
      entrenadores,
      clasesActivas,
      membresiasActivas,
      membresiasPorVencer,
    };

    res.json(indicadores);
  } catch (err) {
    console.error("Error al calcular indicadores:", err);
    res
      .status(500)
      .json({ message: "Error interno del servidor: " + err.message });
  }
});

module.exports = router;
