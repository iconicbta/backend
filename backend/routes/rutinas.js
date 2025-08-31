const express = require("express");
const router = express.Router();
const rutinaController = require("../controllers/rutinasController");
const { protect, verificarPermisos } = require("../middleware/authMiddleware");

// Crear una rutina (Admin y Entrenador)
router.post(
  "/",
  protect,
  (req, res, next) => {
    console.log(
      "Ruta POST /api/rutinas - req.user después de protect:",
      req.user
    );
    next();
  },
  verificarPermisos(["admin", "entrenador"]),
  rutinaController.crearRutina
);

// Listar todas las rutinas (Admin y Entrenador)
router.get(
  "/",
  protect,
  (req, res, next) => {
    console.log(
      "Ruta GET /api/rutinas - req.user después de protect:",
      req.user
    );
    next();
  },
  verificarPermisos(["admin", "entrenador"]),
  rutinaController.listarRutinas
);

// Actualizar una rutina (Solo admin)
router.put(
  "/:id",
  protect,
  (req, res, next) => {
    console.log(
      "Ruta PUT /api/rutinas/:id - req.user después de protect:",
      req.user
    );
    next();
  },
  verificarPermisos(["admin"]),
  rutinaController.actualizarRutina
);

// Asignar una rutina a un cliente (Admin y Entrenador)
router.post(
  "/asignar",
  protect,
  (req, res, next) => {
    console.log(
      "Ruta POST /api/rutinas/asignar - req.user después de protect:",
      req.user
    );
    next();
  },
  verificarPermisos(["admin", "entrenador"]),
  rutinaController.asignarRutina
);

// Actualizar una asignación de rutina (Admin y Entrenador)
router.put(
  "/asignar/:id",
  protect,
  (req, res, next) => {
    console.log(
      "Ruta PUT /api/rutinas/asignar/:id - req.user después de protect:",
      req.user
    );
    next();
  },
  verificarPermisos(["admin", "entrenador"]),
  rutinaController.actualizarAsignacionRutina
);

// Eliminar una asignación de rutina (Solo admin)
router.delete(
  "/asignar/:id",
  protect,
  (req, res, next) => {
    console.log(
      "Ruta DELETE /api/rutinas/asignar/:id - req.user después de protect:",
      req.user
    );
    next();
  },
  verificarPermisos(["admin"]),
  rutinaController.eliminarAsignacionRutina
);

// Consultar todas las rutinas asignadas por número de identificación (Admin, Entrenador y Usuario)
router.get(
  "/consultarRutinasPorNumeroIdentificacion/:numeroIdentificacion",
  protect,
  (req, res, next) => {
    console.log(
      "Ruta GET /api/rutinas/consultarRutinasPorNumeroIdentificacion/:numeroIdentificacion - req.user después de protect:",
      req.user
    );
    next();
  },
  verificarPermisos(["admin", "entrenador", "user"]),
  rutinaController.consultarRutinasPorNumeroIdentificacion
);

module.exports = router;
