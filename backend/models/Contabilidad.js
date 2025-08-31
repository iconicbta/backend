const mongoose = require("mongoose");

const contabilidadSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      enum: ["ingreso", "egreso"],
    },
    monto: {
      type: Number,
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    categoria: {
      type: String,
      default: "",
    },
    cuentaDebito: {
      type: String,
      required: true,
    },
    cuentaCredito: {
      type: String,
      required: true,
    },
    referencia: {
      type: String,
      required: true,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Cambiado de "Usuario" a "User"
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "transacciones" }
);

module.exports = mongoose.model("Contabilidad", contabilidadSchema);
