// backend/models/ConfiguracionPagoLiga.js
const mongoose = require("mongoose");

const configuracionPagoLigaSchema = new mongoose.Schema(
  {
    valorDiario: {
      type: Number,
      required: true,
      default: 8000,
    },
    actualizadoPor: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConfiguracionPagoLiga", configuracionPagoLigaSchema);
