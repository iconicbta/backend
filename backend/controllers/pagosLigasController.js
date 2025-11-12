// backend/controllers/pagosLigasController.js
const obtenerMeses = async (req, res) => {
  res.json([{ _id: 1, nombre: "Noviembre 2025" }]);
};

const crearMes = async (req, res) => {
  res.json({ mensaje: "Mes creado correctamente" });
};

const obtenerPagosPorMes = async (req, res) => {
  res.json([]);
};

const registrarPago = async (req, res) => {
  res.json({ mensaje: "Pago registrado correctamente" });
};

const actualizarValorDiario = async (req, res) => {
  res.json({ mensaje: "Valor diario actualizado correctamente" });
};

module.exports = {
  obtenerMeses,
  crearMes,
  obtenerPagosPorMes,
  registrarPago,
  actualizarValorDiario,
};
