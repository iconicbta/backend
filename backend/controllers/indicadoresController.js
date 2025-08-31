const Cliente = require("../models/Cliente");
const Producto = require("../models/Producto");
const Entrenador = require("../models/Entrenador");
const Clase = require("../models/Clase");
const Membresia = require("../models/Membresia");

const obtenerIndicadores = async (req, res) => {
  try {
    // Total de clientes activos e inactivos
    const clientesActivos = await Cliente.countDocuments({ estado: "activo" });
    const clientesInactivos = await Cliente.countDocuments({
      estado: "inactivo",
    });

    // Cantidad de productos y existencias
    const productos = await Producto.find();
    const totalProductos = productos.length;
    const totalExistencias = productos.reduce(
      (sum, producto) => sum + (producto.stock || 0),
      0
    );

    // Cantidad de entrenadores
    const totalEntrenadores = await Entrenador.countDocuments();

    // Cantidad de clases activas
    const clasesActivas = await Clase.countDocuments({ estado: "activa" });

    // Cantidad de membresías activas (basado en fechafin mayor a la fecha actual)
    const hoy = new Date();
    const membresiasActivas = await Membresia.countDocuments({
      fechafin: { $gt: hoy },
    });

    // Cantidad de membresías por vencer (en los próximos 5 días)
    const cincoDiasDesdeHoy = new Date(hoy);
    cincoDiasDesdeHoy.setDate(hoy.getDate() + 5);
    const membresiasPorVencer = await Membresia.countDocuments({
      fechafin: { $gt: hoy, $lte: cincoDiasDesdeHoy },
    });

    // Responder con los indicadores
    res.status(200).json({
      clientesActivos,
      clientesInactivos,
      totalProductos,
      totalExistencias,
      totalEntrenadores,
      clasesActivas,
      membresiasActivas,
      membresiasPorVencer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerIndicadores };
