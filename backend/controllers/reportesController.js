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
    const end = new Date(fechaFin);

    // =========================
    // 1. PAGOS NORMALES
    // =========================
    const pagosAgg = await Pago.aggregate([
      {
        $match: {
          estado: "Completado",
          fecha: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$monto" },
        },
      },
    ]);

    const totalPagos = pagosAgg[0]?.total || 0;

    // =========================
    // 2. PAGOS LIGAS
    // =========================
    const ligasAgg = await PagoLigaMes.aggregate([
      {
        $match: {
          tipoPago: { $ne: "SYSTEM" },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    const totalLigas = ligasAgg[0]?.total || 0;

    // =========================
    // 3. PAGOS MES
    // =========================
    const pagosMesAgg = await PagaMes.aggregate([
      {
        $match: {
          tipoPago: { $ne: "SYSTEM" },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    const totalPagosMes = pagosMesAgg[0]?.total || 0;

    // =========================
    // TOTAL GENERAL
    // =========================
    const total = totalPagos + totalLigas + totalPagosMes;

    res.json({
      pagos: totalPagos,
      ligas: totalLigas,
      pagosMes: totalPagosMes,
      total,
    });

  } catch (error) {
    console.error("Error resumen general:", error);
    res.status(500).json({ message: "Error al generar resumen general" });
  }
};

module.exports = { resumenGeneral };
