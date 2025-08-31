const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    rol: {
      type: String,
      required: true,
      enum: ["admin", "entrenador", "cliente"],
    },
    password: {
      type: String,
      required: true,
    },
    __v: { type: Number, select: false },
  },
  { collection: "usuarios" }
);

module.exports = mongoose.model("Usuario", UsuarioSchema);
