const PagaMes = require("../models/pagaMesModels");

// OBTENER MESES DISPONIBLES
const obtenerMeses = async (req, res) => {
  try {
    const meses = await PagaMes.distinct("mes");
    const mesesOrdenados = meses.sort((a, b) => {
      const dateA = new Date(a.replace(" de ", " "));
      const dateB = new Date(b.replace(" de ", " "));
      return dateB - dateA;
    });
    res.json(mesesOrdenados.map(m => ({ _id: m, nombre: m })));
  } catch (error) {
    res.status(500).json({ message: "Error al obtener meses" });
  }
};

// CREAR NUEVO MES
const crearMes = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || !nombre.trim()) return res.status(400).json({ message: "Nombre requerido" });

    const existe = await PagaMes.findOne({ mes: nombre.trim() });
    if (existe) return res.status(400).json({ message: "El mes ya existe" });

    const registroFicticio = new PagaMes({
      nombre: "SYSTEM",
      mes: nombre.trim(),
      monto: 0,
      tipoPago: 'SYSTEM'
    });

    await registroFicticio.save();
    res.json({ message: "Mes creado", nombre: nombre.trim() });
  } catch (error) {
    res.status(500).json({ message: "Error al crear mes" });
  }
};

// OBTENER PAGOS
const obtenerPagosPorMes = async (req, res) => {
  try {
    const { mes } = req.params;
    const pagos = await PagaMes.find({ mes }).sort({ createdAt: -1 });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pagos" });
  }
};

// REGISTRAR PAGO MENSUAL
const registrarPagoMes = async (req, res) => {
  try {
    const { nombre, mes, monto, tipoPago, comentario, equipo } = req.body;

    if (!nombre || !mes || !monto || !tipoPago) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    const nuevoPago = new PagaMes({
      nombre: nombre.trim().toUpperCase(),
      mes,
      monto,
      tipoPago,
      comentario: comentario || "",
      equipo: equipo || "General"
    });

    await nuevoPago.save();
    res.status(201).json(nuevoPago);
  } catch (error) {
    res.status(500).json({ message: "Error al registrar pago" });
  }
};

module.exports = {
  obtenerMeses,
  crearMes,
  obtenerPagosPorMes,
  registrarPagoMes
};
