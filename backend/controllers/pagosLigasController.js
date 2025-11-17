// backend/controllers/pagosLigasController.js
const PagoLigaMes = require("../models/PagoLigaMes");
const ConfiguracionPagoLiga = require("../models/ConfiguracionPagoLiga");

const obtenerMeses = async (req, res) => {
  try {
    const meses = await PagoLigaMes.distinct("mes");
    res.json(meses.map(m => ({ _id: m, nombre: m })));
  } catch (error) {
    res.status(500).json({ message: "Error al obtener meses" });
  }
};

const crearMes = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ message: "Nombre del mes requerido" });

    const existe = await PagoLigaMes.findOne({ mes: nombre });
    if (existe) return res.status(400).json({ message: "El mes ya existe" });

    res.json({ message: "Mes creado", nombre });
  } catch (error) {
    res.status(500).json({ message: "Error al crear mes" });
  }
};

const obtenerPagosPorMes = async (req, res) => {
  try {
    const { mes } = req.params;
    const pagos = await PagoLigaMes.find({ mes }).sort({ createdAt: -1 });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pagos" });
  }
};

const registrarPago = async (req, res) => {
  try {
    const {
      nombre,
      equipo = "Ligas",
      mes,
      diasAsistidos,
      total,
      valorDiarioUsado,
      diasPagados = []  // ← AHORA SÍ SE GUARDA
    } = req.body;

    if (!nombre || !mes || !diasAsistidos || !total) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    const nuevoPago = new PagoLigaMes({
      nombre: nombre.trim().toUpperCase(),
      equipo,
      mes,
      diasAsistidos,
      total,
      valorDiarioUsado: valorDiarioUsado || total / diasAsistidos,
      diasPagados,
    });

    await nuevoPago.save();
    res.status(201).json(nuevoPago);
  } catch (error) {
    console.error("Error al registrar pago:", error);
    res.status(500).json({ message: "Error al registrar pago" });
  }
};

const actualizarValorDiario = async (req, res) => {
  try {
    const { valor } = req.body;
    if (!valor || valor <= 0) return res.status(400).json({ message: "Valor inválido" });

    let config = await ConfiguracionPagoLiga.findOne();
    if (!config) {
      config = new ConfiguracionPagoLiga({ valorDiario: valor });
    } else {
      config.valorDiario = valor;
    }
    await config.save();

    res.json({ message: "Valor diario actualizado", valorDiario: config.valorDiario });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar valor diario" });
  }
};

module.exports = {
  obtenerMeses,
  crearMes,
  obtenerPagosPorMes,
  registrarPago,
  actualizarValorDiario,
};
