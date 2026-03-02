const Pago = require("../models/Pago");
const PagoLigaMes = require("../models/PagoLigaMes");
const PagaMes = require("../models/pagaMesModels");

const resumenGeneral = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ message: "fechaInicio y fechaFin son requeridos" });
    }

    const start = new Date(fechaInicio);
    start.setHours(0, 0, 0, 0);

    const end = new Date(fechaFin);
    end.setHours(23, 59, 59, 999);

    // =========================
    // 1️⃣ PRODUCTOS
    // =========================
    const pagosProductos = await Pago.find({
      estado: "Completado",
      fecha: { $gte: start, $lte: end },
    });

    let productos = { total: 0, efectivo: 0, nequi: 0 };

    pagosProductos.forEach((p) => {
      productos.total += p.monto || 0;
      if (p.metodoPago === "Efectivo") productos.efectivo += p.monto || 0;
      if (p.metodoPago === "Nequi") productos.nequi += p.monto || 0;
    });

    // =========================
    // 2️⃣ LIGAS
    // =========================
    const pagosLigas = await PagoLigaMes.find({
      tipoPago: { $ne: "SYSTEM" },
      createdAt: { $gte: start, $lte: end },
    });

    let ligas = { total: 0, efectivo: 0, nequi: 0 };

    pagosLigas.forEach((p) => {
      ligas.total += p.total || 0;
      if (p.tipoPago === "Efectivo") ligas.efectivo += p.total || 0;
      if (p.tipoPago === "Nequi") ligas.nequi += p.total || 0;
    });

    // =========================
    // 3️⃣ MENSUALIDADES
    // =========================
    const pagosMensualidades = await PagaMes.find({
      tipoPago: { $ne: "SYSTEM" },
      createdAt: { $gte: start, $lte: end },
    });

    let mensualidades = { total: 0, efectivo: 0, nequi: 0 };

    pagosMensualidades.forEach((p) => {
      mensualidades.total += p.total || 0;
      if (p.tipoPago === "Efectivo") mensualidades.efectivo += p.total || 0;
      if (p.tipoPago === "Nequi") mensualidades.nequi += p.total || 0;
    });

    const totalGeneral =
      productos.total +
      ligas.total +
      mensualidades.total;

    res.json({
      ligas,
      mensualidades,
      productos,
      totalGeneral,
    });

  } catch (error) {
    console.error("Error resumen general:", error);
    res.status(500).json({ message: "Error al generar resumen general" });
  }
};

module.exports = { resumenGeneral };
