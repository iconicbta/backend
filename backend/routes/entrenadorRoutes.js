const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  listarEntrenadores,
  agregarEntrenador,
  obtenerEntrenadorPorId,
  editarEntrenador,
  eliminarEntrenador,
} = require("../controllers/entrenadoresController");

router.get("/", protect, listarEntrenadores);
router.get("/:id", protect, obtenerEntrenadorPorId);
router.put("/:id", protect, editarEntrenador);
router.post("/", protect, agregarEntrenador);
router.delete("/:id", protect, eliminarEntrenador);

module.exports = router;
