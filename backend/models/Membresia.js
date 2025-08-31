const mongoose = require("mongoose");

const membresiaSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    duracion: {
      type: Number,
      required: true,
      min: 1,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    fechainicio: {
      type: Date,
      default: Date.now, // Corregido a función
    },
    fechafin: {
      type: Date,
    },
    sesionesRestantes: {
      type: Number,
      default: 0,
      min: 0,
    },
    estado: {
      type: String,
      enum: ["activa", "inactiva"],
      default: "activa",
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Membresia", membresiaSchema);
