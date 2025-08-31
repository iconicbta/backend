const express = require("express");
const router = express.Router();
const {
  listarMembresias,
  obtenerMembresiaPorId,
  agregarMembresia,
  editarMembresia,
  eliminarMembresia,
} = require("../controllers/membresiaController");
const { protect, verificarRol } = require("../middleware/authMiddleware");

// Rutas de membresías
router.get("/", protect, listarMembresias);
router.get("/:id", protect, obtenerMembresiaPorId);
router.post("/", protect, agregarMembresia);
router.put("/:id", protect, editarMembresia);
router.delete("/:id", protect, eliminarMembresia);

module.exports = router;
