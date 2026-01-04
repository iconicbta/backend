const mongoose = require("mongoose");

const pagoMensualidadSchema = new mongoose.Schema({
  cliente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Cliente", 
    required: true 
  },
  año: { 
    type: Number, 
    required: true 
  },
  mes: { 
    type: String, 
    required: true 
  },
  monto: { 
    type: Number, 
    required: true 
  },
  metodoPago: { 
    type: String, 
    enum: ['Efectivo', 'Nequi', 'Transferencia', 'Tarjeta'], 
    required: true 
  },
  pagoReferencia: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Pago" 
  },
  creadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("PagoMensualidad", pagoMensualidadSchema);
