// backend/controllers/transaccionController.js

const mongoose = require("mongoose");
const Transaccion = require("../models/Transaccion");
const Pago = require("../models/Pago");

// Listar pagos + egresos
const listarTransacciones = async (req, res) => {
  try {
    console.log("Iniciando listarTransacciones...");

    const { fechaInicio, fechaFin, metodoPago } = req.query;

    // --- Filtros de fechas ---
    const rangoFechas = {};
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      rangoFechas.$gte = inicio;
      rangoFechas.$lte = fin;
    } else if (fechaInicio) {
      rangoFechas.$gte = new Date(fechaInicio);
    } else if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      rangoFechas.$lte = fin;
    }

    // --- Egresos ---
    const filtroEgresos = { tipo: "egreso" };
    if (Object.keys(rangoFechas).length > 0) {
      filtroEgresos.fecha = rangoFechas;
    }

    const egresos = await Transaccion.find(filtroEgresos)
      .populate("creadoPor", "nombre email")
      .sort({ fecha: -1 })
      .lean();

    const totalEgresos = egresos.reduce((acc, e) => acc + e.monto, 0);

    // --- Pagos ---
    const filtroPagos = {};
    if (Object.keys(rangoFechas).length > 0) {
      filtroPagos.fecha = rangoFechas;
    }
    if (metodoPago) {
      filtroPagos.metodoPago = metodoPago;
    }

    const pagos = await Pago.find(filtroPagos)
      .populate("cliente", "nombre apellido")
      .populate("creadoPor", "nombre email")
      .sort({ fecha: -1 })
      .lean();

    const totalIngresos = pagos.reduce((acc, p) => acc + p.monto, 0);

    // --- Normalizamos para que frontend los lea igual ---
    const pagosNormalizados = pagos.map((p) => ({
      _id: p._id,
      tipo: "ingreso",
      descripcion: `Pago de cliente - Método: ${p.metodoPago}`,
      cliente: p.cliente
        ? `${p.cliente.nombre} ${p.cliente.apellido}`
        : "N/A",
      monto: p.monto,
      fecha: p.fecha,
      metodoPago: p.metodoPago || "N/A",
      cuentaDebito: p.cuentaDebito || "N/A",
      cuentaCredito: p.cuentaCredito || "N/A",
      referencia: p.referencia || "N/A",
      creadoPor: p.creadoPor,
    }));

    const egresosNormalizados = egresos.map((e) => ({
      _id: e._id,
      tipo: "egreso",
      descripcion: e.descripcion,
      cliente: "N/A",
      monto: e.monto,
      fecha: e.fecha,
      metodoPago: "N/A", // solo aplica a pagos
      cuentaDebito: e.cuentaDebito || "N/A",
      cuentaCredito: e.cuentaCredito || "N/A",
      referencia: e.referencia || "N/A",
      creadoPor: e.creadoPor,
    }));

    const transacciones = [...pagosNormalizados, ...egresosNormalizados].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );

    const balance = totalIngresos - totalEgresos;

    // 👇 Ajustado para que frontend lo entienda
    res.json({
      transacciones,
      totales: {
        ingresos: totalIngresos,
        egresos: totalEgresos,
        balance,
      },
    });
  } catch (error) {
    console.error("Error al listar transacciones:", error.message);
    res.status(500).json({
      mensaje: "Error al listar transacciones",
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
