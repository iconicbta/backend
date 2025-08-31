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

// Verificar que las funciones del controlador estén definidas
const controllers = {
  crearComposicionCorporal,
  obtenerComposicionesCorporales,
  obtenerComposicionCorporal,
  actualizarComposicionCorporal,
  eliminarComposicionCorporal,
  consultarComposicionesPorCliente,
};
for (const [name, fn] of Object.entries(controllers)) {
  if (!fn || typeof fn !== "function") {
    throw new Error(`${name} no está definido o no es una función`);
  }
}

// Ruta para registrar composición corporal (solo para admin/entrenador)
router.post(
  "/",
  protect,
  verificarPermisos(["admin", "entrenador"]),
  crearComposicionCorporal
);

// Ruta para obtener todas las composiciones corporales (solo admin)
router.get(
  "/",
  protect,
  verificarPermisos(["admin"]),
  obtenerComposicionesCorporales
);

// Ruta para obtener una composición corporal por ID (solo admin)
router.get(
  "/:id",
  protect,
  verificarPermisos(["admin"]),
  obtenerComposicionCorporal
);

// Ruta para actualizar composición corporal (admin o entrenador que la creó)
router.put(
  "/:id",
  protect,
  verificarPermisos(["admin", "entrenador"]),
  actualizarComposicionCorporal
);

// Ruta para eliminar composición corporal (solo admin)
router.delete(
  "/:id",
  protect,
  verificarPermisos(["admin"]),
  eliminarComposicionCorporal
);

// Ruta para consultar composiciones corporales por cliente (pública)
router.get("/cliente/:identificacion", consultarComposicionesPorCliente);

module.exports = router;

