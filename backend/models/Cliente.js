const mongoose = require("mongoose");

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, default: "" },
  email: { type: String, required: true },
  telefono: { type: String, default: "" },
  direccion: { type: String, default: "" },
  estado: { type: String, default: "activo", enum: ["activo", "inactivo"] },
  numeroIdentificacion: { type: String, required: true, unique: true },
  fechaNacimiento: { type: Date, required: true },
  edad: { type: Number, required: true },
  tipoDocumento: { type: String, required: true },
  rh: { type: String, default: "" },
  eps: { type: String, default: "" },
  tallaTrenSuperior: { type: String, default: "" },
  tallaTrenInferior: { type: String, default: "" },
  nombreResponsable: { type: String, default: "" },
  especialidad: { type: String, required: true }, // Cambiado de equipo a especialidad
});

module.exports = mongoose.model("Cliente", clienteSchema);
