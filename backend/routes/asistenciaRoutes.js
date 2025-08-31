const express = require("express");
const router = express.Router();
const Asistencia = require("../models/Asistencia");

// Obtener todas las asistencias
router.get("/", async (req, res) => {
  try {
    const asistencias = await Asistencia.find()
      .populate("clienteId", "nombre")
      .populate("claseId", "nombre");
    res.json(asistencias);
  } catch (err) {
    res
      .status(404)
      .json({ mensaje: "Recurso no encontrado", error: err.message });
  }
});

// Registrar una nueva asistencia
router.post("/", async (req, res) => {
  try {
    const asistencia = new Asistencia(req.body);
    await asistencia.save();
    res.status(201).json(asistencia);
  } catch (err) {
    res
      .status(400)
      .json({ mensaje: "Error al registrar asistencia", error: err.message });
  }
});

module.exports = router;
