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
// 1️⃣ PRODUCTOS
// =========================
const pagosProductos = await Pago.find({
  estado: "Completado",
  fecha: { $gte: start, $lte: end }
});

let productos = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };

pagosProductos.forEach((p) => {
  const monto = Number(p.monto) || 0;
  productos.total += monto;

  if (p.metodoPago === "Efectivo") productos.efectivo += monto;
  else if (p.metodoPago === "Transferencia" || p.metodoPago === "Nequi") productos.transferencia += monto;
  else if (p.metodoPago === "Tarjeta") productos.tarjeta += monto;
});

  // =========================
    // 2️⃣ LIGAS (Corregido para filtrar por día/semana/mes)
    // =========================
    const pagosLigas = await PagoLigaMes.find({
      tipoPago: { $ne: "SYSTEM" },
      $or: [
        { createdAt: { $gte: start, $lte: end } },
        { fecha: { $gte: start, $lte: end } }
      ]
    });

    let ligas = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };
    pagosLigas.forEach((p) => {
      const monto = Number(p.total) || 0;
      ligas.total += monto;
      
      const metodo = (p.tipoPago || "").toLowerCase();
      if (metodo === "efectivo") ligas.efectivo += monto;
      else if (metodo === "transferencia" || metodo === "nequi") ligas.transferencia += monto;
      else if (metodo === "tarjeta") ligas.tarjeta += monto;
    });
 // =========================
// 3️⃣ MENSUALIDADES
// =========================
const pagosMensualidades = await PagaMes.find({
  nombre: { $ne: "SYSTEM" },
  tipoPago: { $ne: "SYSTEM" },
  createdAt: { $gte: start, $lte: end }
});

let mensualidades = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };

pagosMensualidades.forEach((p) => {
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
const cierreDiario = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ message: "fecha es requerida" });
    }

    // Ajuste para Colombia
    const start = new Date(fecha);
    start.setHours(0,0,0,0);

    const end = new Date(fecha);
    end.setHours(23,59,59,999);

    // PRODUCTOS
    const pagosProductos = await Pago.find({
      estado: "Completado",
      fecha: { $gte: start, $lte: end }
    });

    let productos = { total:0, efectivo:0, transferencia:0, tarjeta:0 };

    pagosProductos.forEach(p => {
      const monto = Number(p.monto) || 0;
      productos.total += monto;

      if(p.metodoPago === "Efectivo") productos.efectivo += monto;
      else if(p.metodoPago === "Transferencia" || p.metodoPago === "Nequi") productos.transferencia += monto;
      else if(p.metodoPago === "Tarjeta") productos.tarjeta += monto;
    });

    // LIGAS
    const pagosLigas = await PagoLigaMes.find({
      createdAt: { $gte: start, $lte: end }
    });

    let ligas = { total:0, efectivo:0, transferencia:0, tarjeta:0 };

    pagosLigas.forEach(p => {
      const monto = Number(p.total) || 0;
      ligas.total += monto;

      const metodo = (p.tipoPago || "").toLowerCase();

      if(metodo === "efectivo") ligas.efectivo += monto;
      else if(metodo === "transferencia" || metodo === "nequi") ligas.transferencia += monto;
      else if(metodo === "tarjeta") ligas.tarjeta += monto;
    });

    // MENSUALIDADES
    const pagosMensualidades = await PagaMes.find({
      createdAt: { $gte: start, $lte: end },
      nombre: { $ne: "SYSTEM" }
    });

    let mensualidades = { total:0, efectivo:0, transferencia:0, tarjeta:0 };

    pagosMensualidades.forEach(p => {
      const monto = Number(p.total) || 0;
      mensualidades.total += monto;

      if(p.tipoPago === "Efectivo") mensualidades.efectivo += monto;
      else if(p.tipoPago === "Nequi" || p.tipoPago === "Transferencia") mensualidades.transferencia += monto;
      else if(p.tipoPago === "Tarjeta") mensualidades.tarjeta += monto;
    });

    const totalDia =
      productos.total +
      ligas.total +
      mensualidades.total;

    res.json({
      fecha,
      ligas,
      mensualidades,
      productos,
      totalDia
    });

  } catch (error) {
    console.error("Error cierre diario", error);
    res.status(500).json({ message:"Error cierre diario" });
  }
};
module.exports = { resumenGeneral, cierreDiario };
