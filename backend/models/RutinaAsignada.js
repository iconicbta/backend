// backend/models/RutinaAsignada.js
const mongoose = require("mongoose");

const rutinaAsignadaSchema = new mongoose.Schema(
  {
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
    numeroIdentificacion: { type: String },
    rutinaId: { type: mongoose.Schema.Types.ObjectId, ref: "Rutina", required: true },
    diasEntrenamiento: [{ type: String }], // ej: ["Lunes","Miercoles"]
    diasDescanso: [{ type: String }],
    asignadaPor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RutinaAsignada", rutinaAsignadaSchema);
