const mongoose = require("mongoose");

const pagaMesSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, uppercase: true },
  equipo: { type: String, default: "General" }, 
  mes: { type: String, required: true }, // Ej: "Enero 2026"
  monto: { type: Number, required: true }, // Valor de la mensualidad
  tipoPago: { 
    type: String, 
    enum: ['Efectivo', 'Nequi', 'SYSTEM'], 
    default: 'Efectivo' 
  },
  comentario: { type: String, trim: true, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PagaMes", pagaMesSchema);
