const mongoose = require("mongoose");

const transaccionSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: ["ingreso", "egreso"],
  },
  concepto: {
    type: String,
    required: true,
  },
  monto: {
    type: Number,
    required: true,
  },
  fecha: {
    type: Date,
    required: true,
  },
  metodoPago: {
    type: String,
    default: "efectivo",
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaccion", transaccionSchema);
