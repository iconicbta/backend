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
    // 2️⃣ LIGAS (Corregido con Transferencia y Tarjeta)
    // =========================
    const pagosLigas = await PagoLigaMes.find({
      tipoPago: { $ne: "SYSTEM" },
      createdAt: { $gte: start, $lte: end },
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
// 3️⃣ MENSUALIDADES (Sincronizado con Módulo Pagos)
// =========================
const nombreMesMap = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Obtenemos el nombre del mes basado en la fecha de inicio del filtro
const mesNombreFiltro = nombreMesMap[start.getMonth()]; 

const pagosMensualidades = await PagaMes.find({
  nombre: { $ne: "SYSTEM" },
  anio: start.getFullYear().toString(),
  mesesPagados: mesNombreFiltro // 👈 Busca registros que contengan ese mes específico
});

let mensualidades = { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 };

pagosMensualidades.forEach((p) => {
  // Dividimos el total por la cantidad de meses para obtener el valor de ESTE mes
  const valorMes = (Number(p.total) || 0) / (p.mesesPagados.length || 1);
  
  mensualidades.total += valorMes;

  if (p.tipoPago === "Efectivo") {
    mensualidades.efectivo += valorMes;
  } else if (p.tipoPago === "Nequi" || p.tipoPago === "Transferencia") {
    mensualidades.transferencia += valorMes;
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
