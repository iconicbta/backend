// backend/routes/entrenadorRoutes.js
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

// 👇 NUEVO: lista de equipos (especialidades únicas)
// IMPORTANTE: debe ir antes de la ruta con /:id
router.get("/equipos", protect, listarEquipos);

router.get("/:id", protect, obtenerEntrenadorPorId);
router.post("/", protect, crearEntrenador);
router.put("/:id", protect, actualizarEntrenador);
router.delete("/:id", protect, eliminarEntrenador);

module.exports = router;
