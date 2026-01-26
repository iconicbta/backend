const mongoose = require("mongoose");

const pagaMesSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, uppercase: true },
  equipo: { type: String, default: "General" },
  anio: { type: String, required: true }, // Ej: "2026"
  plan: { type: String, default: "Black" }, // Black, White, Gold
  total: { type: Number, required: true },
  mesesPagados: { type: [String], default: [] }, // Guardará ["Enero", "Marzo"]
  tipoPago: { 
      type: String, 
      enum: ['Efectivo', 'Nequi', 'SYSTEM'], 
      default: 'Efectivo' 
    },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PagaMes", pagaMesSchema);
