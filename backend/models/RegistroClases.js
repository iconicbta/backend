const mongoose = require("mongoose");

const registroClasesSchema = new mongoose.Schema({
  numeroIdentificacion: { type: String, required: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  entrenadorId: { type: String, required: true },
  nombreClase: { type: String, required: true },
  dia: { type: String, required: true },
  horarioInicio: { type: String, required: true },
  horarioFin: { type: String, required: true },
  fechaRegistro: { type: Date, default: Date.now },
});

module.exports = mongoose.model("RegistroClases", registroClasesSchema);
