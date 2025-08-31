const express = require("express");
const router = express.Router();
const Entrenador = require("../models/Entrenador");
const { protect } = require("../middleware/authMiddleware");

router.post("/migrate-especialidades", protect, async (req, res) => {
  try {
    const entrenadores = await Entrenador.find();
    let migrados = 0;
    for (let entrenador of entrenadores) {
      if (typeof entrenador.especialidad === "string") {
        entrenador.especialidad = [entrenador.especialidad];
        await entrenador.save();
        migrados++;
        console.log(`Migrado: ${entrenador.nombre}`);
      }
    }
    console.log(`Migración completada. Total migrados: ${migrados}`);
    res.json({
      mensaje: `Migración completada. ${migrados} documentos actualizados.`,
    });
  } catch (err) {
    console.error("Error durante la migración:", err);
    res
      .status(500)
      .json({ mensaje: "Error en la migración", detalle: err.message });
  }
});

module.exports = router;
