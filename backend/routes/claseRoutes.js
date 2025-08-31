const express = require("express");
const router = express.Router();
const { protect, verificarPermisos } = require("../middleware/authMiddleware");
const {
  obtenerClasesDisponibles,
  registrarClienteEnClase,
  consultarClasesPorNumeroIdentificacion,
  obtenerInscritosPorClase,
  obtenerClases,
  obtenerTodasInscripciones,
} = require("../controllers/claseController");

// Solo recepcionistas y admins pueden acceder
router.get(
  "/disponibles",
  protect,
  verificarPermisos(["admin", "recepcionista"]),
  obtenerClasesDisponibles
);

// Solo admins, recepcionistas y usuarios pueden acceder
router.post(
  "/registrar",
  protect,
  verificarPermisos(["admin", "recepcionista", "user"]),
  registrarClienteEnClase
);

// Solo admins, recepcionistas y usuarios pueden acceder
router.get(
  "/consultar/:numeroIdentificacion",
  protect,
  verificarPermisos(["admin", "recepcionista", "user"]),
  consultarClasesPorNumeroIdentificacion
);

// Solo admins y recepcionistas pueden acceder (usando query params)
router.get(
  "/inscritos",
  protect,
  verificarPermisos(["admin", "recepcionista"]),
  obtenerInscritosPorClase
);

// Solo recepcionistas y admins pueden acceder
router.get(
  "/",
  protect,
  verificarPermisos(["admin", "recepcionista"]),
  obtenerClases
);

// Solo admins pueden acceder (nueva ruta para todas las inscripciones)
router.get(
  "/todas-inscripciones",
  protect,
  verificarPermisos(["admin"]),
  obtenerTodasInscripciones
);

module.exports = router;
