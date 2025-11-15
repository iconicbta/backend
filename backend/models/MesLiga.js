// backend/models/MesLiga.js
import mongoose from "mongoose";

const mesLigaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true }, // "Noviembre 2025"
  },
  { timestamps: true }
);

export default mongoose.model("MesLiga", mesLigaSchema);
