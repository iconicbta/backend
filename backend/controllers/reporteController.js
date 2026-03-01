const Pago = require("../models/Pago");
const PagaMes = require("../models/pagaMesModels");
const PagoLigaMes = require("../models/PagoLigaMes");

const resumenGeneral = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({ message: "Rango de fechas requerido" });
    }

    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);

    // ==========================
    // 1️⃣ PRODUCTOS
    // ==========================
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

    // ==========================
    // 2️⃣ MENSUALIDADES
    // ==========================
    const pagosMensualidades = await PagaMes.find({
      createdAt: { $gte: start, $lte: end },
      tipoPago: { $ne: "SYSTEM" },
    });

    let mensualidades = { total: 0, efectivo: 0, nequi: 0 };

    pagosMensualidades.forEach((p) => {
      mensualidades.total += p.total || 0;
      if (p.tipoPago === "Efectivo") mensualidades.efectivo += p.total || 0;
      if (p.tipoPago === "Nequi") mensualidades.nequi += p.total || 0;
    });

    // ==========================
    // 3️⃣ LIGAS
    // ==========================
    const pagosLigas = await PagoLigaMes.find({
      createdAt: { $gte: start, $lte: end },
      tipoPago: { $ne: "SYSTEM" },
    });

    let ligas = { total: 0, efectivo: 0, nequi: 0 };

    pagosLigas.forEach((p) => {
      ligas.total += p.total || 0;
      if (p.tipoPago === "Efectivo") ligas.efectivo += p.total || 0;
      if (p.tipoPago === "Nequi") ligas.nequi += p.total || 0;
    });

    // ==========================
    // TOTAL GENERAL
    // ==========================
    const totalGeneral =
      productos.total +
      mensualidades.total +
      ligas.total;

    res.json({
      ligas,
      mensualidades,
      productos,
      totalGeneral,
    });

  } catch (error) {
    console.error("Error en resumen general:", error);
    res.status(500).json({ message: "Error al generar resumen general" });
  }
};

module.exports = { resumenGeneral };
