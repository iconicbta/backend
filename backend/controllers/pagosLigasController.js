exports.obtenerMeses = async (req, res) => {
  res.json([{ _id: 1, nombre: "Noviembre 2025" }]);
};

exports.crearMes = async (req, res) => {
  res.json({ mensaje: "Mes creado correctamente" });
};

exports.obtenerPagosPorMes = async (req, res) => {
  res.json([]);
};

exports.registrarPago = async (req, res) => {
  res.json({ mensaje: "Pago registrado correctamente" });
};

exports.actualizarValorDiario = async (req, res) => {
  res.json({ mensaje: "Valor diario actualizado correctamente" });
};
