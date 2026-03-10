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
    start.setHours(0, 0, 0, 0);

    const end = new Date(fechaFin);
    end.setHours(23, 59, 59, 999);

    // =========================================
    // UTILIDADES PARA MES Y AÑO
    // =========================================
    const monthNames = [
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
    ];

    const mesNombre = monthNames[start.getMonth()];
    const anio = start.getFullYear().toString();
    const mesTextoLigas = `${mesNombre} ${anio}`;
    console.log("=== DEBUG RESUMEN ===");
console.log("Fecha inicio:", start);
console.log("Mes calculado:", mesNombre);
console.log("Año calculado:", anio);
console.log("Texto ligas:", mesTextoLigas);
console.log("=====================");

    // =========================================
    // 1️⃣ PRODUCTOS (por fecha real)
    // =========================================
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

    // =========================================
    // 2️⃣ MENSUALIDADES (por año + mes pagado)
    // =========================================
    const pagosMensualidades = await PagaMes.find({
      anio: anio,
      mesesPagados: mesNombre,
      tipoPago: { $ne: "SYSTEM" },
    });

    let mensualidades = { total: 0, efectivo: 0, nequi: 0 };

   pagosMensualidades.forEach((p) => {

  const valorPorMes = (p.total || 0) / (p.mesesPagados.length || 1);

  mensualidades.total += valorPorMes;

  if (p.tipoPago === "Efectivo") {
    mensualidades.efectivo += valorPorMes;
  }

  if (p.tipoPago === "Nequi") {
    mensualidades.nequi += valorPorMes;
  }

});
    // =========================================
    // 3️⃣ LIGAS (por mes textual)
    // =========================================
    const pagosLigas = await PagoLigaMes.find({
      mes: mesTextoLigas,
      tipoPago: { $ne: "SYSTEM" },
    });

    let ligas = { total: 0, efectivo: 0, nequi: 0 };

    pagosLigas.forEach((p) => {
      ligas.total += p.total || 0;
      if (p.tipoPago === "Efectivo") ligas.efectivo += p.total || 0;
      if (p.tipoPago === "Nequi") ligas.nequi += p.total || 0;
    });

    // =========================================
    // TOTAL GENERAL
    // =========================================
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
