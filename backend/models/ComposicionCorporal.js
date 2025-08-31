const mongoose = require("mongoose");

const composicionCorporalSchema = new mongoose.Schema(
  {
    numeroIdentificacion: { type: String, required: true, index: true },
    fecha: { type: Date, required: true },
    peso: { type: Number, required: true },
    altura: { type: Number, required: true },
    imc: { type: Number },
    porcentajeGrasa: { type: Number, default: 0 },
    porcentajeMusculo: { type: Number, default: 0 },
    notas: { type: String, default: "" },
    medidas: {
      brazoDerecho: { type: Number, default: 0 },
      brazoIzquierdo: { type: Number, default: 0 },
      pecho: { type: Number, default: 0 },
      cintura: { type: Number, default: 0 },
      cadera: { type: Number, default: 0 },
      piernaDerecha: { type: Number, default: 0 },
      piernaIzquierda: { type: Number, default: 0 },
    },
    objetivo: { type: String, default: "" },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
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
