// models/ConfiguracionPagoLiga.js
import mongoose from "mongoose";

const configuracionPagoLigaSchema = new mongoose.Schema(
  {
    valorDiario: {
      type: Number,
      required: true,
      default: 8000,
    },
    actualizadoPor: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ConfiguracionPagoLiga", configuracionPagoLigaSchema);
