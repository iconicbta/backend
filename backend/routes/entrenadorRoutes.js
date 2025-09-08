const express = require("express");
const {
  obtenerEntrenadores,
  obtenerEntrenadorPorId,
  crearEntrenador,
  actualizarEntrenador,
  eliminarEntrenador,
  listarEquipos,
} = require("../controllers/entrenadoresController");
const { protect } = require("../middleware/authMiddleware"); // si usas auth

const router = express.Router();

// Lista de entrenadores
router.get("/", protect, obtenerEntrenadores);
router.get("/:id", protect, obtenerEntrenadorPorId);
router.post("/", protect, crearEntrenador);
router.put("/:id", protect, actualizarEntrenador);
router.delete("/:id", protect, eliminarEntrenador);

// 👇 NUEVO: lista de equipos (especialidades únicas)
router.get("/equipos", protect, listarEquipos);

module.exports = router;
