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
    end.setHours(23, 59, 59, 999);

    // =========================
    // 1️⃣ PRODUCTOS Y PAGOS RÁPIDOS
    // Aplicamos el filtro exacto de pagoController.js
    // =========================
    const pagosProductos = await Pago.find({
      estado: "Completado",
      fecha: { $gte: start, $lte: end },
      $or: [
        { producto: { $exists: true, $ne: null } },
        { productoManual: { $exists: true, $ne: "" } }
      ]
    });

    let productos = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };

    pagosProductos.forEach((p) => {
      const monto = Number(p.monto) || 0;
      productos.total += monto;

      if (p.metodoPago === "Efectivo") {
        productos.efectivo += monto;
      } else if (p.metodoPago === "Transferencia") {
        productos.transferencia += monto;
      } else if (p.metodoPago === "Tarjeta") {
        productos.tarjeta += monto;
      }
    });

   // =========================
    // 2️⃣ LIGAS (Filtrado por rango exacto: día, semana o mes)
    // =========================
    const pagosLigas = await PagoLigaMes.find({
      tipoPago: { $ne: "SYSTEM" },
      createdAt: { $gte: start, $lte: end }, // 👈 Usa el rango dinámico
    });

    let ligas = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };
    pagosLigas.forEach((p) => {
      const monto = Number(p.total) || 0;
      ligas.total += monto;
      if (p.tipoPago === "Efectivo") ligas.efectivo += monto;
      else if (p.tipoPago === "Transferencia" || p.tipoPago === "Nequi") ligas.transferencia += monto;
      else if (p.tipoPago === "Tarjeta") ligas.tarjeta += monto;
    });

    // =========================
    // 3️⃣ MENSUALIDADES (Filtrado por rango exacto: día, semana o mes)
    // =========================
    const pagosMensualidades = await PagaMes.find({
      nombre: { $ne: "SYSTEM" },
      tipoPago: { $ne: "SYSTEM" },
      createdAt: { $gte: start, $lte: end }, // 👈 Cambiado de 'mesesPagados' a 'createdAt'
    });

    let mensualidades = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };
    pagosMensualidades.forEach((p) => {
      // Nota: Aquí sumamos el total del registro porque es un pago realizado 
      // físicamente en el rango de fechas seleccionado (día/semana).
      const monto = Number(p.total) || 0;
      mensualidades.total += monto;

      if (p.tipoPago === "Efectivo") {
        mensualidades.efectivo += monto;
      } else if (p.tipoPago === "Nequi" || p.tipoPago === "Transferencia") {
        mensualidades.transferencia += monto;
      } else if (p.tipoPago === "Tarjeta") {
        mensualidades.tarjeta += monto;
      }
    });

    const totalGeneral = productos.total + ligas.total + mensualidades.total;

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
