// backend/models/ConfiguracionPagoLiga.js
const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  valorDiario: { type: Number, default: 8000 },
});

module.exports = mongoose.model("ConfiguracionPagoLiga", configSchema);
