const express = require("express");
const router = express.Router();
const medicionPorristasController = require("../controllers/medicionPorristasController");
const { protect, verificarPermisos } = require("../middleware/authMiddleware");

// Crear una medición (Admin y Entrenador)
router.post(
  "/",
  protect,
  verificarPermisos(["admin", "entrenador"]),
  medicionPorristasController.crearMedicionPorristas
);

// Listar todas las mediciones (Admin y Entrenador)
router.get(
  "/",
  protect,
  verificarPermisos(["admin", "entrenador"]),
  medicionPorristasController.listarMedicionesPorristas
);

// Actualizar una medición (Solo admin)
router.put(
  "/:id",
  protect,
  verificarPermisos(["admin"]),
  medicionPorristasController.actualizarMedicionPorristas
);

module.exports = router;
