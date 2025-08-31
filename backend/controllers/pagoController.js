const Pago = require("../models/Pago");
const Cliente = require("../models/Cliente");
const Producto = require("../models/Producto");

// Listar todos los pagos (protegida)
const listarPagos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, nombreCliente } = req.query;
    const query = { estado: "Completado" }; // Restaurar filtro de estado

    if (fechaInicio && fechaFin) {
      const start = new Date(fechaInicio);
      const end = new Date(fechaFin);
      if (isNaN(start) || isNaN(end)) {
        throw new Error("Fechas inválidas");
      }
      query.fecha = { $gte: start, $lte: end };
    }

    console.log("Query enviada a Pago.find:", query);
    let pagos = await Pago.find(query)
      .populate("cliente", "nombre apellido")
      .populate("producto", "nombre precio")
      .populate("creadoPor", "nombre")
      .lean();

    console.log("Pagos encontrados en la base:", pagos.length);

    if (nombreCliente) {
      console.log("Filtrando por nombreCliente:", nombreCliente);
      pagos = pagos.filter((pago) => {
        const nombreCompleto = `${pago.cliente?.nombre || ""} ${
          pago.cliente?.apellido || ""
        }`.toLowerCase();
        return nombreCompleto.includes(nombreCliente.toLowerCase().trim());
      });
    }

    const total = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);
    console.log("Total calculado:", total);
    res.json({ pagos, total });
  } catch (error) {
    console.error("Error detallado al listar pagos:", error.stack);
    res.status(500).json({ mensaje: "Error al listar pagos", error: error.message });
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
      .populate("cliente", "nombre apellido")
      .populate("producto", "nombre precio")
      .lean();
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al consultar pagos", error: error.message });
  }
};

// Agregar un nuevo pago (protegida)
const agregarPago = async (req, res) => {
  try {
    const { cliente, producto, cantidad, monto, fecha, metodoPago } = req.body;

    if (!cliente || !producto || !cantidad || !monto || !fecha || !metodoPago) {
      return res.status(400).json({
        mensaje: "Faltan campos requeridos",
        detalle: "cliente, producto, cantidad, monto, fecha y metodoPago son obligatorios",
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
      estado: "Completado", // Asegurar que se establezca el estado
    });
    const pagoGuardado = await nuevoPago.save();

    res.status(201).json({ mensaje: "Pago creado con éxito", pago: pagoGuardado });
  } catch (error) {
    console.error("Error detallado al crear pago:", error.stack);
    res.status(500).json({ mensaje: "Error al crear pago", error: error.message });
  }
};

// Obtener un pago por ID (protegida)
const obtenerPagoPorId = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id)
      .populate("cliente", "nombre apellido")
      .populate("producto", "nombre precio")
      .populate("creadoPor", "nombre")
      .lean();
    if (!pago) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }
    res.json(pago);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener pago", error: error.message });
  }
};

// Editar un pago (protegida)
const editarPago = async (req, res) => {
  try {
    const { cliente, producto, cantidad, monto, fecha, metodoPago } = req.body;
    const pagoExistente = await Pago.findById(req.params.id).populate("producto", "stock");

    if (!pagoExistente) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }

    const fechaPago = new Date(fecha);
    if (isNaN(fechaPago.getTime())) {
      return res.status(400).json({ mensaje: "Fecha inválida" });
    }

    if (producto && producto !== pagoExistente.producto?.toString()) {
      const productoDoc = await Producto.findById(producto);
      if (!productoDoc) return res.status(404).json({ mensaje: "Producto no encontrado" });
      if (productoDoc.stock < cantidad) {
        return res.status(400).json({
          mensaje: "Stock insuficiente",
          detalle: `Stock disponible: ${productoDoc.stock}, solicitado: ${cantidad}`,
        });
      }
      if (pagoExistente.producto) {
        const productoAnterior = await Producto.findById(pagoExistente.producto);
        if (productoAnterior) {
          productoAnterior.stock += pagoExistente.cantidad || 0;
          await productoAnterior.save();
        }
      }
      productoDoc.stock -= cantidad;
      await productoDoc.save();
    } else if (cantidad && cantidad !== pagoExistente.cantidad) {
      const diferencia = cantidad - (pagoExistente.cantidad || 0);
      const productoDoc = await Producto.findById(pagoExistente.producto);
      if (productoDoc && productoDoc.stock < diferencia) {
        return res.status(400).json({
          mensaje: "Stock insuficiente",
          detalle: `Stock disponible: ${productoDoc.stock}, diferencia requerida: ${diferencia}`,
        });
      }
      productoDoc.stock -= diferencia;
      await productoDoc.save();
    }

    const pagoActualizado = await Pago.findByIdAndUpdate(
      req.params.id,
      {
        cliente: cliente || pagoExistente.cliente,
        producto: producto || pagoExistente.producto,
        cantidad: Number(cantidad) || pagoExistente.cantidad,
        monto: Number(monto) || pagoExistente.monto,
        fecha: fechaPago,
        metodoPago: metodoPago || pagoExistente.metodoPago,
        estado: "Completado", // Asegurar que el estado se mantenga
      },
      { new: true, runValidators: true }
    )
      .populate("cliente", "nombre apellido")
      .populate("producto", "nombre precio")
      .populate("creadoPor", "nombre")
      .lean();

    res.json({ mensaje: "Pago actualizado con éxito", pago: pagoActualizado });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar pago", error: error.message });
  }
};

// Eliminar un pago (protegida)
const eliminarPago = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id).populate("producto");
    if (!pago) {
      return res.status(404).json({ mensaje: "Pago no encontrado" });
    }

    if (pago.producto) {
      const productoDoc = await Producto.findById(pago.producto);
      if (productoDoc) {
        productoDoc.stock += pago.cantidad || 0;
        await productoDoc.save();
      }
    }

    await Pago.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Pago eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar pago", error: error.message });
  }
};

// Nuevo controlador para calcular ingresos totales (para Resumen Financiero)
const obtenerIngresos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const query = { estado: "Completado" };

    if (fechaInicio && fechaFin) {
      query.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin),
      };
    }

    const pagos = await Pago.find(query).lean();
    const totalIngresos = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);

    res.json({ ingresos: totalIngresos, detalles: pagos });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al calcular ingresos", error: error.message });
  }
};

module.exports = {
  listarPagos,
  consultarPagosPorCedula,
  agregarPago,
  obtenerPagoPorId,
  editarPago,
  eliminarPago,
  obtenerIngresos,
};
