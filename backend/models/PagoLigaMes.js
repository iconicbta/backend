// backend/models/PagoLigaMes.js
const mongoose = require("mongoose");

const pagoLigaMesSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    equipo: { type: String, required: true },
    mes: { type: String, required: true }, // Ej: "2025-11"
    diasAsistidos: { type: Number, required: true },
    total: { type: Number, required: true },
    valorDiarioUsado: { type: Number, required: true }, // Valor usado en el momento del registro
  },
  { timestamps: true }
);

module.exports = mongoose.model("PagoLigaMes", pagoLigaMesSchema);
