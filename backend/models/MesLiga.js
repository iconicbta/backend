// backend/models/MesLiga.js
const mongoose = require("mongoose");

const mesLigaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true }, // "Noviembre 2025"
  },
  { timestamps: true }
);

module.exports = mongoose.model("MesLiga", mesLigaSchema);
