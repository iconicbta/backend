// backend/controllers/pagosLigasController.js
const MesLiga = require("../models/MesLiga");
const PagoLigaMes = require("../models/PagoLigaMes");
const ConfiguracionPagoLiga = require("../models/ConfiguracionPagoLiga");

const obtenerMeses = async (req, res) => {
  try {
    const meses = await MesLiga.find().sort({ createdAt: -1 });
    res.json(meses.map(m => ({ _id: m._id, nombre: m.nombre })));
  } catch (error) {
    console.error("Error al obtener meses:", error);
    res.status(500).json({ message: "Error al obtener meses", error: error.message });
  }
};

const crearMes = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ message: "Nombre requerido" });
  try {
    const existe = await MesLiga.findOne({ nombre });
    if (existe) return res.status(400).json({ message: "Mes ya existe" });
    const nuevoMes = await MesLiga.create({ nombre });
    res.json({ message: "Mes creado correctamente", mes: { _id: nuevoMes._id, nombre } });
  } catch (error) {
    console.error("Error al crear mes:", error);
    res.status(500).json({ message: "Error al crear mes", error: error.message });
  }
};

const obtenerPagosPorMes = async (req, res) => {
  const { mes } = req.params;
  try {
    const pagos = await PagoLigaMes.find({ mes }).sort({ createdAt: -1 });
    res.json(pagos);
  } catch (error) {
    console.error("Error al obtener pagos por mes:", error);
    res.status(500).json({ message: "Error al obtener pagos", error: error.message });
  }
};

const registrarPago = async (req, res) => {
  const { nombre, equipo, mes, diasAsistidos } = req.body;
  if (!nombre || !equipo || !mes || !diasAsistidos) return res.status(400).json({ message: "Faltan datos" });
  try {
    const config = await ConfiguracionPagoLiga.findOne();
    const valorDiario = config?.valorDiario || 8000;
    const total = diasAsistidos * valorDiario;
    const pago = await PagoLigaMes.create({
      nombre,
      equipo,
      mes,
      diasAsistidos,
      total,
      valorDiarioUsado: valorDiario,
    });
    res.json({ message: "Pago registrado correctamente", pago });
  } catch (error) {
    console.error("Error al registrar pago:", error);
    res.status(500).json({ message: "Error al registrar pago", error: error.message });
  }
};

const actualizarValorDiario = async (req, res) => {
  const { valor } = req.body;
  if (!valor || valor <= 0) return res.status(400).json({ message: "Valor inválido" });
  try {
    let config = await ConfiguracionPagoLiga.findOne();
    if (!config) {
      config = await ConfiguracionPagoLiga.create({ valorDiario: valor });
    } else {
      config.valorDiario = valor;
      await config.save();
    }
    res.json({ message: "Valor diario actualizado correctamente", config });
  } catch (error) {
    console.error("Error al actualizar valor diario:", error);
    res.status(500).json({ message: "Error al actualizar valor diario", error: error.message });
  }
};

module.exports = {
  obtenerMeses,
  crearMes,
  obtenerPagosPorMes,
  registrarPago,
  actualizarValorDiario,
};
