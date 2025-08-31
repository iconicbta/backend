const express = require("express");
const router = express.Router();
const Transaccion = require("../models/Transaccion");
const Pago = require("../models/Pago");
const { authMiddleware, checkRole } = require("../middleware/auth");

// Obtener todas las transacciones (egresos) y calcular ingresos desde pagos
router.get("/", authMiddleware, checkRole(["admin"]), async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const query = { tipo: "egreso" }; // Solo buscamos egresos

    if (fechaInicio || fechaFin) {
      query.fecha = {};
      if (fechaInicio) query.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) query.fecha.$lte = new Date(fechaFin);
    }

    console.log("Buscando egresos con query:", query);
    const transacciones = await Transaccion.find(query).lean();
    console.log("Egresos encontrados:", transacciones);

    // Calcular ingresos desde la colección de pagos
    const pagosQuery = {};
    if (fechaInicio || fechaFin) {
      pagosQuery.fecha = {};
      if (fechaInicio) pagosQuery.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) pagosQuery.fecha.$lte = new Date(fechaFin);
    }

    console.log("Buscando pagos con query:", pagosQuery);
    const pagos = await Pago.find(pagosQuery).lean();
    console.log("Pagos encontrados:", pagos);

    const ingresos = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const egresos = transacciones.reduce((sum, t) => sum + t.monto, 0);
    const saldo = ingresos - egresos;

    console.log(
      "Ingresos (desde pagos):",
      ingresos,
      "Egresos:",
      egresos,
      "Saldo:",
      saldo
    );

    res.json({ transacciones, ingresos, egresos, saldo });
  } catch (error) {
    console.error("Error al listar transacciones:", error);
    res
      .status(500)
      .json({ mensaje: "Error al listar transacciones", error: error.message });
  }
});

// Crear una nueva transacción (egreso)
router.post("/", authMiddleware, checkRole(["admin"]), async (req, res) => {
  try {
    const { descripcion, monto, tipo, categoria, fecha } = req.body;

    if (!monto || !tipo || !fecha) {
      return res
        .status(400)
        .json({ mensaje: "Monto, tipo y fecha son obligatorios" });
    }

    if (tipo !== "egreso") {
      return res
        .status(400)
        .json({ mensaje: "Solo se permiten transacciones de tipo egreso" });
    }

    const transaccion = new Transaccion({
      descripcion,
      monto,
      tipo,
      categoria: categoria || "Otro",
      fecha,
    });

    await transaccion.save();
    res.status(201).json(transaccion);
  } catch (error) {
    console.error("Error al crear transacción:", error);
    res
      .status(400)
      .json({ mensaje: "Error al crear transacción", error: error.message });
  }
});

module.exports = router;
