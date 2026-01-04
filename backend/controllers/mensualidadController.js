const PagoMensualidad = require("../models/PagoMensualidad");
const Pago = require("../models/Pago");
const Contabilidad = require("../models/Contabilidad");
const Producto = require("../models/Producto");

const registrarMensualidadCompleta = async (req, res) => {
  try {
    const { clienteId, productoId, cantidad, monto, fecha, metodoPago, mes, año } = req.body;

    // 1. Manejo de Stock
    if (productoId && productoId !== "OTRO") {
      const productoDoc = await Producto.findById(productoId);
      if (productoDoc && productoDoc.stock >= cantidad) {
        productoDoc.stock -= cantidad;
        await productoDoc.save();
      }
    }

    // 2. Registro en Historial General (Modelo Pago)
    const nuevoPagoGeneral = new Pago({
      cliente: clienteId,
      producto: productoId === "OTRO" ? null : productoId,
      cantidad: Number(cantidad),
      monto: Number(monto),
      fecha: new Date(fecha),
      metodoPago,
      creadoPor: req.user._id,
      estado: "Completado"
    });
    const pagoGuardado = await nuevoPagoGeneral.save();

    // 3. Registro en Planilla Visual (Modelo PagoMensualidad)
    const nuevaMensualidad = new PagoMensualidad({
      cliente: clienteId,
      año: Number(año),
      mes,
      monto: Number(monto),
      metodoPago,
      pagoReferencia: pagoGuardado._id,
      creadoPor: req.user._id
    });
    await nuevaMensualidad.save();

    // 4. Registro en Contabilidad
    const nuevaTransaccion = new Contabilidad({
      tipo: "ingreso",
      monto: Number(monto),
      fecha: new Date(fecha),
      descripcion: `Mensualidad ${mes} ${año} - Cliente ID: ${clienteId}`,
      categoria: "Pago de cliente",
      cuentaDebito: "Caja",
      cuentaCredito: "Ingresos por servicios",
      referencia: `PAGO-${pagoGuardado._id}`,
      creadoPor: req.user._id,
    });
    await nuevaTransaccion.save();

    res.status(201).json({ mensaje: "Pago y mensualidad registrados", pago: pagoGuardado });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el registro", error: error.message });
  }
};

const obtenerMensualidadesPorAño = async (req, res) => {
  try {
    const { año } = req.params;
    const datos = await PagoMensualidad.find({ año: Number(año) }).lean();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener datos" });
  }
};

module.exports = { registrarMensualidadCompleta, obtenerMensualidadesPorAño };
