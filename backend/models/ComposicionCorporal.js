const mongoose = require("mongoose");

const composicionCorporalSchema = new mongoose.Schema(
  {
    numeroIdentificacion: {
      type: String,
      required: true,
      index: true,
      trim: true,
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
      default: 0,
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
      trim: true,
    },
    medidas: {
      brazoDerecho: { type: Number, default: 0 },
      brazoIzquierdo: { type: Number, default: 0 },
      pecho: { type: Number, default: 0 },
      cintura: { type: Number, default: 0 },
      cadera: { type: Number, default: 0 },
      piernaDerecha: { type: Number, default: 0 },
      piernaIzquierda: { type: Number, default: 0 },
    },
    objetivo: {
      type: String,
      default: "",
      trim: true,
    },
    // ✅ Asegúrese de que el nombre del modelo coincida exactamente con User.js
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // IMPORTANTE: debe coincidir con mongoose.model("User", …)
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "composiciones_corporales", // 🔹 nombre fijo de la colección
  }
);

module.exports = mongoose.model("ComposicionCorporal", composicionCorporalSchema);
