const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, default: "" }, // Añadido
    precio: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    estado: { type: String, enum: ["activo", "inactivo"], default: "activo" }, // Añadido
  },
  { timestamps: true }
);

module.exports = mongoose.model("Producto", productoSchema);
