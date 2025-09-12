const express = require("express");
const router = express.Router();
const {
  crearComposicionCorporal,
  obtenerComposicionesCorporales,
  obtenerComposicionCorporal,
  actualizarComposicionCorporal,
  eliminarComposicionCorporal,
  consultarComposicionesPorCliente,
} = require("../controllers/composicionCorporalController");
const { protect, verificarPermisos } = require("../middleware/authMiddleware");

// Ruta pública para consultar composiciones por número de identificación
// Debe ir primero para evitar conflicto con la ruta '/:id'
router.get("/cliente/:identificacion", consultarComposicionesPorCliente);

// Rutas privadas
router.post(
  "/",
  protect,
  verificarPermisos(["admin", "entrenador"]),
  crearComposicionCorporal
);

router.get(
  "/",
  protect,
  verificarPermisos(["admin"]),
  obtenerComposicionesCorporales
);

router.get(
  "/:id",
  protect,
  verificarPermisos(["admin"]),
  obtenerComposicionCorporal
);

router.put(
  "/:id",
  protect,
  verificarPermisos(["admin", "entrenador"]),
  actualizarComposicionCorporal
);

router.delete(
  "/:id",
  protect,
  verificarPermisos(["admin"]),
  eliminarComposicionCorporal
);

module.exports = router;
