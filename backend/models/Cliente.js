const mongoose = require("mongoose");
const clienteSchema = new mongoose.Schema({
  numeroIdentificacion: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  telefono: { type: String },
  email: { type: String },
  fechaNacimiento: { type: Date, required: true },
  edad: { type: Number, required: true },
  tipoDocumento: { type: String, enum: ["C.C", "T.I", "RC", "PPT"], default: "C.C", required: true },
  rh: { type: String },
  eps: { type: String },
  tallaTrenSuperior: { type: String },
  tallaTrenInferior: { type: String },
  nombreResponsable: { type: String },
  direccion: { type: String },
  equipo: { type: String, required: true }, // 👈 nuevo campo
  fechaRegistro: { type: Date, default: Date.now },
  estado: { type: String, enum: ["activo", "inactivo"], default: "activo" },
  membresias: [{ type: mongoose.Schema.Types.ObjectId, ref: "Membresia" }],
});
