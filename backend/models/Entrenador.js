const mongoose = require("mongoose");

const diaSchema = new mongoose.Schema({
  dia: String,
  horarioInicio: String,
  horarioFin: String,
});

const claseSchema = new mongoose.Schema({
  nombreClase: String,
  capacidadMaxima: { type: Number, default: 10 },
  dias: [diaSchema],
});

const entrenadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  telefono: String,
  especialidad: [{ type: String, required: true }], // Cambiado a array de strings
  clases: [claseSchema],
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

entrenadorSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

entrenadorSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model("Entrenador", entrenadorSchema);
