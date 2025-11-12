// backend/controllers/pagosLigasController.js
const obtenerMeses = async (req, res) => {
  console.log("📅 [PagosLigas] GET /meses");
  res.json([{ _id: 1, nombre: "Noviembre 2025" }]);
};

const crearMes = async (req, res) => {
  console.log("🆕 [PagosLigas] POST /crear-mes");
  res.json({ mensaje: "Mes creado correctamente" });
};

const obtenerPagosPorMes = async (req, res) => {
  const { mesId } = req.params;
  console.log(`💰 [PagosLigas] GET /pagos/${mesId}`);
  res.json([]);
};

const registrarPago = async (req, res) => {
  console.log("💸 [PagosLigas] POST /registrar-pago");
  res.json({ mensaje: "Pago registrado correctamente" });
};

const actualizarValorDiario = async (req, res) => {
  console.log("⚙️ [PagosLigas] PUT /valor-diario");
  res.json({ mensaje: "Valor diario actualizado correctamente" });
};

module.exports = {
  obtenerMeses,
  crearMes,
  obtenerPagosPorMes,
  registrarPago,
  actualizarValorDiario,
};
