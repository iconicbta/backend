const mongoose = require("mongoose");

const asistenciaSchema = new mongoose.Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true,
  },
  claseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clase",
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Asistencia", asistenciaSchema);
