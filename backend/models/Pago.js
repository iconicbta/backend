const mongoose = require("mongoose");

const pagoSchema = new mongoose.Schema({
  // 🔹 Modificamos estos dos para que NO sean obligatorios (permitir pago rápido)
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: false, 
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: false,
  },
  // ⚡ NUEVOS CAMPOS PARA PAGO RÁPIDO
  clienteManual: { type: String },
  productoManual: { type: String },
  esPagoRapido: { type: Boolean, default: false },

  // Resto de los campos (se mantienen igual)
  cantidad: {
    type: Number,
    required: false, // Cambiado a false porque en pago rápido no siempre hay stock
  },
  monto: {
    type: Number,
    required: true,
  },
  fecha: {
    type: Date,
    required: true,
  },
  metodoPago: {
    type: String,
    required: true,
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  estado: {
    type: String,
    default: "Completado",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para actualizar el campo updatedAt antes de guardar
pagoSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware para actualizar el campo updatedAt antes de una actualización
pagoSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model("Pago", pagoSchema);
