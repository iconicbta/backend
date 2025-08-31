const mongoose = require("mongoose");
const Transaccion = require("../models/Transaccion");
const Pago = require("../models/Pago");

// Listar solo egresos con filtros y totales
const listarTransacciones = async (req, res) => {
  try {
    console.log("Iniciando listarTransacciones...");

    const { fechaInicio, fechaFin } = req.query;

    const filtro = { tipo: "egreso" };
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      filtro.fecha = { $gte: inicio, $lte: fin };
    } else if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      filtro.fecha = { $gte: inicio };
    } else if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      filtro.fecha = { $lte: fin };
    }

    const transacciones = await Transaccion.find(filtro)
      .populate("cliente", "nombre apellido")
      .populate("creadoPor", "nombre email")
      .sort({ fecha: -1 });

    const egresos = await Transaccion.aggregate([
      { $match: filtro },
      { $group: { _id: null, total: { $sum: "$monto" } } },
    ]);

    const filtroPagos = {};
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      filtroPagos.fecha = { $gte: inicio, $lte: fin };
    } else if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      filtroPagos.fecha = { $gte: inicio };
    } else if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      filtroPagos.fecha = { $lte: fin };
    }

    const totalPagos = await Pago.aggregate([
      { $match: filtroPagos },
      { $group: { _id: null, total: { $sum: "$monto" } } },
    ]);

    const totalEgresos = egresos.length > 0 ? egresos[0].total : 0;
    const totalIngresos = totalPagos.length > 0 ? totalPagos[0].total : 0;
    const balance = totalIngresos - totalEgresos;

    console.log("Egresos encontrados:", transacciones);
    console.log("Totales calculados:", {
      totalIngresos,
      totalEgresos,
      balance,
    });

    res.json({
      transacciones,
      totales: { ingresos: totalIngresos, egresos: totalEgresos, balance },
    });
  } catch (error) {
    console.error("Error al listar transacciones:", error.message);
    res.status(500).json({
      mensaje: "Error al listar transacciones",
      detalle: error.message,
    });
  }
};

// Agregar una nueva transacción (solo egresos)
const agregarTransaccion = async (req, res) => {
  try {
    console.log("Iniciando agregarTransaccion...");
    const { tipo, descripcion, monto, fecha, categoria } = req.body;

    // Validar campos obligatorios
    if (!tipo || !descripcion || !monto || !fecha || !categoria) {
      return res
        .status(400)
        .json({ mensaje: "Todos los campos son obligatorios" });
    }

    // Forzar que el tipo sea "egreso"
    if (tipo !== "egreso") {
      return res
        .status(400)
        .json({ mensaje: "Solo se pueden crear egresos desde esta sección" });
    }

    // Convertir monto a número y validar
    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({ mensaje: "Monto inválido" });
    }

    const transaccion = new Transaccion({
      tipo: "egreso",
      descripcion,
      monto: montoNum,
      fecha: new Date(fecha),
      categoria,
      creadoPor: req.user?._id || null,
    });

    const savedTransaccion = await transaccion.save();
    await savedTransaccion.populate("cliente", "nombre apellido");
    await savedTransaccion.populate("creadoPor", "nombre email");
    console.log("Transacción guardada:", savedTransaccion);
    res.status(201).json(savedTransaccion);
  } catch (error) {
    console.error("Error al agregar transacción:", error.message);
    res.status(500).json({
      mensaje: "Error al agregar transacción",
      detalle: error.message,
    });
  }
};

// Obtener una transacción por ID
const obtenerTransaccionPorId = async (req, res) => {
  try {
    console.log("Iniciando obtenerTransaccionPorId...");
    const transaccion = await Transaccion.findById(req.params.id)
      .populate("cliente", "nombre apellido")
      .populate("creadoPor", "nombre email");
    if (!transaccion) {
      console.log("Transacción no encontrada para el ID:", req.params.id);
      return res.status(404).json({ mensaje: "Transacción no encontrada" });
    }
    console.log("Transacción encontrada:", transaccion);
    res.status(200).json(transaccion);
  } catch (error) {
    console.error("Error al obtener transacción:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener transacción",
      detalle: error.message,
    });
  }
};

// Editar una transacción existente (solo egresos)
const editarTransaccion = async (req, res) => {
  try {
    console.log("Iniciando editarTransaccion...");
    const { tipo, descripcion, monto, fecha, categoria } = req.body;

    // Validar campos obligatorios
    if (!tipo || !descripcion || !monto || !fecha || !categoria) {
      return res
        .status(400)
        .json({ mensaje: "Todos los campos son obligatorios" });
    }

    // Forzar que el tipo sea "egreso"
    if (tipo !== "egreso") {
      return res
        .status(400)
        .json({ mensaje: "Solo se pueden editar egresos desde esta sección" });
    }

    // Convertir monto a número y validar
    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      return res.status(400).json({ mensaje: "Monto inválido" });
    }

    const transaccion = await Transaccion.findByIdAndUpdate(
      req.params.id,
      {
        tipo: "egreso",
        descripcion,
        monto: montoNum,
        fecha: new Date(fecha),
        categoria,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );
    if (!transaccion) {
      console.log("Transacción no encontrada para el ID:", req.params.id);
      return res.status(404).json({ mensaje: "Transacción no encontrada" });
    }
    await transaccion.populate("cliente", "nombre apellido");
    await transaccion.populate("creadoPor", "nombre email");
    console.log("Transacción actualizada:", transaccion);
    res.json(transaccion);
  } catch (error) {
    console.error("Error al actualizar transacción:", error.message);
    res.status(500).json({
      mensaje: "Error al actualizar transacción",
      detalle: error.message,
    });
  }
};

// Eliminar una transacción
const eliminarTransaccion = async (req, res) => {
  try {
    console.log("Iniciando eliminarTransaccion...");
    const transaccion = await Transaccion.findByIdAndDelete(req.params.id);
    if (!transaccion) {
      console.log("Transacción no encontrada para el ID:", req.params.id);
      return res.status(404).json({ mensaje: "Transacción no encontrada" });
    }
    console.log("Transacción eliminada:", transaccion);
    res.status(200).json({ mensaje: "Transacción eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar transacción:", error.message);
    res.status(500).json({
      mensaje: "Error al eliminar transacción",
      detalle: error.message,
    });
  }
};

module.exports = {
  listarTransacciones,
  agregarTransaccion,
  obtenerTransaccionPorId,
  editarTransaccion,
  eliminarTransaccion,
};
