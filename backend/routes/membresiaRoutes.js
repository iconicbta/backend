const express = require("express");
const router = express.Router();
const membresiaController = require("../controllers/membresiaController");
const { protect } = require("../middleware/authMiddleware");

// Rutas protegidas
router.get("/", protect, membresiaController.obtenerMembresias);
router.post("/", protect, membresiaController.crearMembresia);
router.get("/:id", protect, membresiaController.obtenerMembresiaPorId);
router.put("/:id", protect, membresiaController.actualizarMembresia);
router.delete("/:id", protect, membresiaController.eliminarMembresia);

module.exports = router;
