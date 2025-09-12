const mongoose = require("mongoose");

const composicionCorporalSchema = new mongoose.Schema(
  {
    numeroIdentificacion: {
      type: String,
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    peso: {
      type: Number,
      required: true,
    },
    altura: {
      type: Number,
      required: true,
    },
    imc: {
      type: Number,
    },
    porcentajeGrasa: {
      type: Number,
      default: 0,
    },
    porcentajeMusculo: {
      type: Number,
      default: 0,
    },
    notas: {
      type: String,
      default: "",
    },
    medidas: {
      type: Object,
      default: {},
    },
    objetivo: {
      type: String,
      default: "",
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ComposicionCorporal",
  composicionCorporalSchema
);
