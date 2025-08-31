const mongoose = require("mongoose");

const rutinaSchema = new mongoose.Schema(
  {
    grupoMuscular: { type: String, required: true },
    nombreEjercicio: { type: String, required: true },
    series: { type: Number, required: true },
    repeticiones: { type: Number, required: true },
    descripcion: { type: String },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario", // Asegurado que coincide con el modelo de usuario
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rutina", rutinaSchema);
