const mongoose = require("mongoose");

const medicionPorristasSchema = new mongoose.Schema(
  {
    clienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    entrenadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entrenador",
      required: true,
    },
    equipo: { type: String, required: true },
    categoria: { type: String, required: true },
    posicion: { type: String, required: true },
    ejercicios: [{
      nombre: { type: String, required: true },
      calificacion: { type: Number, required: true, min: 1, max: 10 },
    }],
    ponderacion: { type: Number, default: 0 }, // Promedio de calificaciones
    pasaNivel: { type: Boolean, default: false }, // Basado en ponderacion >= 7
    descripcion: { type: String },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  { timestamps: true }
);

medicionPorristasSchema.pre('save', function (next) {
  if (this.ejercicios.length > 0) {
    const sum = this.ejercicios.reduce((acc, ej) => acc + ej.calificacion, 0);
    this.ponderacion = sum / this.ejercicios.length;
    this.pasaNivel = this.ponderacion >= 7;
  }
  next();
});

module.exports = mongoose.model("MedicionPorristas", medicionPorristasSchema);
