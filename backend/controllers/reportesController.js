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

    // 1️⃣ PRODUCTOS
    const pagosProductos = await Pago.find({
      estado: "Completado",
      createdAt: { $gte: start, $lte: end }
    });

    let productos = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };
    pagosProductos.forEach((p) => {
      const monto = Number(p.monto) || 0;
      productos.total += monto;
      const metodo = (p.metodoPago || "").toLowerCase().trim();
      if (metodo === "efectivo") productos.efectivo += monto;
      else if (metodo === "transferencia" || metodo === "nequi") productos.transferencia += monto;
      else if (metodo === "tarjeta") productos.tarjeta += monto;
    });

    // 2️⃣ LIGAS
    const pagosLigas = await PagoLigaMes.find({
      tipoPago: { $ne: "SYSTEM" },
      createdAt: { $gte: start, $lte: end }
    });

    let ligas = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };
    pagosLigas.forEach((p) => {
      const monto = Number(p.total) || 0;
      ligas.total += monto;
      const metodo = (p.tipoPago || "").toLowerCase().trim();
      if (metodo === "efectivo") ligas.efectivo += monto;
      else if (metodo === "transferencia" || metodo === "nequi") ligas.transferencia += monto;
      else if (metodo === "tarjeta") ligas.tarjeta += monto;
    });

    // 3️⃣ MENSUALIDADES
    const pagosMensualidades = await PagaMes.find({
      nombre: { $ne: "SYSTEM" },
      tipoPago: { $ne: "SYSTEM" },
      createdAt: { $gte: start, $lte: end }
    });

    let mensualidades = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };
    pagosMensualidades.forEach((p) => {
      const monto = Number(p.total) || 0;
      mensualidades.total += monto;
      const metodo = (p.tipoPago || "").toLowerCase().trim();
      if (metodo === "efectivo") mensualidades.efectivo += monto;
      else if (metodo === "transferencia" || metodo === "nequi") mensualidades.transferencia += monto;
      else if (metodo === "tarjeta") mensualidades.tarjeta += monto;
    });

    res.json({
      ligas,
      mensualidades,
      productos,
      totalGeneral: productos.total + ligas.total + mensualidades.total,
    });
  } catch (error) {
    console.error("Error resumen general:", error);
    res.status(500).json({ message: "Error al generar resumen general" });
  }
};

const cierreDiario = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ message: "fecha es requerida" });

    const [year, month, day] = fecha.split("-").map(Number);

    const start = new Date(Date.UTC(year, month - 1, day, 5, 0, 0, 0));
    const end   = new Date(Date.UTC(year, month - 1, day + 1, 4, 59, 59, 999));

    const filter = { createdAt: { $gte: start, $lte: end } };

    // PRODUCTOS
    const pProd = await Pago.find({ ...filter, estado: "Completado" });
    let productos = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };
    pProd.forEach(p => {
      const m = Number(p.monto) || 0;
      productos.total += m;
      const met = (p.metodoPago || "").toLowerCase().trim();
      if (met === "efectivo") productos.efectivo += m;
      else if (met === "transferencia" || met === "nequi") productos.transferencia += m;
      else if (met === "tarjeta") productos.tarjeta += m;
    });

    // LIGAS
    const pLig = await PagoLigaMes.find({ ...filter, tipoPago: { $ne: "SYSTEM" } });
    let ligas = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };
    pLig.forEach(p => {
      const m = Number(p.total) || 0;
      ligas.total += m;
      const met = (p.tipoPago || "").toLowerCase().trim();
      if (met === "efectivo") ligas.efectivo += m;
      else if (met === "transferencia" || met === "nequi") ligas.transferencia += m;
      else if (met === "tarjeta") ligas.tarjeta += m;
    });

    // MENSUALIDADES
    const pMens = await PagaMes.find({ ...filter, nombre: { $ne: "SYSTEM" }, tipoPago: { $ne: "SYSTEM" } });
    let mensualidades = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };
    pMens.forEach(p => {
      const m = Number(p.total) || 0;
      mensualidades.total += m;
      const met = (p.tipoPago || "").toLowerCase().trim();
      if (met === "efectivo") mensualidades.efectivo += m;
      else if (met === "transferencia" || met === "nequi") mensualidades.transferencia += m;
      else if (met === "tarjeta") mensualidades.tarjeta += m;
    });

    res.json({
      fecha,
      rangoUTC: { start, end }, // 👈 para verificar en consola que el rango es correcto
      ligas,
      mensualidades,
      productos,
      totalDia: productos.total + ligas.total + mensualidades.total
    });
  } catch (error) {
    console.error("Error cierre diario", error);
    res.status(500).json({ message: "Error cierre diario" });
  }
};

// 🔍 DIAGNÓSTICO TEMPORAL - úsalo para ver las fechas UTC reales en MongoDB
// Llámalo así: GET /reportes/diagnostico?fecha=2026-04-08
const diagnostico = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ message: "fecha es requerida" });

    const [year, month, day] = fecha.split("-").map(Number);

    // Rango amplio: 2 días completos en UTC para ver todo
    const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const end   = new Date(Date.UTC(year, month - 1, day + 1, 23, 59, 59, 999));

    const ligas = await PagoLigaMes.find({
      tipoPago: { $ne: "SYSTEM" },
      createdAt: { $gte: start, $lte: end }
    }).select("createdAt total tipoPago");

    const mens = await PagaMes.find({
      tipoPago: { $ne: "SYSTEM" },
      createdAt: { $gte: start, $lte: end }
    }).select("createdAt total tipoPago");

    const prods = await Pago.find({
      estado: "Completado",
      createdAt: { $gte: start, $lte: end }
    }).select("createdAt monto metodoPago");

    const formatear = (p, montoField) => ({
      utc:      p.createdAt.toISOString(),
      colombia: new Date(p.createdAt.getTime() - 5 * 60 * 60 * 1000).toISOString().replace("T", " ").slice(0, 19),
      monto:    p[montoField]
    });

    res.json({
      fecha_consultada: fecha,
      rango_UTC: { start, end },
      ligas:         ligas.map(p => formatear(p, "total")),
      mensualidades: mens.map(p => formatear(p, "total")),
      productos:     prods.map(p => formatear(p, "monto")),
    });
  } catch (e) {
    console.error("Error diagnóstico", e);
    res.status(500).json({ message: e.message });
  }
};

module.exports = { resumenGeneral, cierreDiario, diagnostico };
