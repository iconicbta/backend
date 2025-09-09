// backend/controllers/pagoController.js
const Pago = require("../models/Pago");
const Cliente = require("../models/Cliente");
const Producto = require("../models/Producto");

// Listar todos los pagos (protegida)
const listarPagos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, nombreCliente, equipo } = req.query;
    const query = { estado: "Completado" };

    if (fechaInicio && fechaFin) {
      const start = new Date(fechaInicio);
      const end = new Date(fechaFin);
      if (isNaN(start) || isNaN(end)) {
        throw new Error("Fechas inválidas");
      }
      query.fecha = { $gte: start, $lte: end };
    }

    // 🔑 Traemos todos los pagos con populate de cliente (incluye equipo)
    let pagos = await Pago.find(query)
      .populate({
        path: "cliente",
        select: "nombre apellido equipo",
      })
      .populate("producto", "nombre precio")
      .populate("creadoPor", "nombre")
      .lean();

    // Filtro por nombre del cliente
    if (nombreCliente) {
      pagos = pagos.filter((pago) => {
        const nombreCompleto = `${pago.cliente?.nombre || ""} ${
          pago.cliente?.apellido || ""
        }`.toLowerCase();
        return nombreCompleto.includes(nombreCliente.toLowerCase().trim());
      });
    }

    // Filtro por equipo
    if (equipo) {
      pagos = pagos.filter((pago) => pago.cliente?.equipo === equipo);
    }

    const total = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);
    res.json({ pagos, total });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al listar pagos", error: error.message });
  }
};

// Consultar pagos por número de identificación (pública)
const consultarPagosPorCedula = async (req, res) => {
  try {
    const { numeroIdentificacion } = req.params;

    const cliente = await Cliente.findOne({ numeroIdentificacion });
    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    const pagos = await Pago.find({ cliente: cliente._id })
      .populate({
        path: "cliente",
        select: "nombre apellido equipo",
      })
      .populate("producto", "nombre precio")
      .lean();

    const total = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);

    res.json({ pagos, total });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al consultar pagos", error: error.message });
  }
};

// Agregar un nuevo pago (protegida)
const agregarPago = async (req, res) => {
  try {
    const { cliente, producto, cantidad, monto, fecha, metodoPago } = req.body;

    if (!cliente || !producto || !cantidad || !monto || !fecha || !metodoPago) {
      return res.status(400).json({
        mensaje: "Faltan campos requeridos",
      });
    }

    const fechaPago = new Date(fecha);
    if (isNaN(fechaPago.getTime())) {
      return res.status(400).json({ mensaje: "Fecha inválida" });
    }

    const clienteDoc = await Cliente.findById(cliente);
    if (!clienteDoc) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    const productoDoc = await Producto.findById(producto);
    if (!productoDoc) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    if (productoDoc.stock < cantidad) {
      return res.status(400).json({
        mensaje: "Stock insuficiente",
        detalle: `Stock disponible: ${productoDoc.stock}, solicitado: ${cantidad}`,
      });
    }

    productoDoc.stock -= cantidad;
    await productoDoc.save();

    const nuevoPago = new Pago({
      cliente,
      producto,
      cantidad: Number(cantidad),
      monto: Number(monto),
      fecha: fechaPago,
      metodoPago,
      creadoPor: req.user._id,
      estado: "Completado",
    });

    const pagoGuardado = await nuevoPago.save();

    res
      .status(201)
      .json({ mensaje: "Pago creado con éxito", pago: pagoGuardado });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al crear pago", error: error.message });
  }
};

// Obtener un pago por ID (protegida)
const obtenerPagoPorId = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id)
      .populate({
        path: "cliente",
        select: "nombre apellido equipo",
      })
      .populate("producto", "nombre precio")
      .populate("creadoPor", "nombre")
      .lean();

    if (!pago) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }

    res.json(pago);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener pago", error: error.message });
  }
};

module.exports = {
  listarPagos,
  consultarPagosPorCedula,
  agregarPago,
  obtenerPagoPorId,
};
