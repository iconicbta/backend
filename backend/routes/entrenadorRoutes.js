const express = require("express");
const {
  obtenerEntrenadores,
  obtenerEntrenadorPorId,
  crearEntrenador,
  actualizarEntrenador,
  eliminarEntrenador,
  listarEquipos, // 👈 importar aquí
} = require("../controllers/entrenadoresController");

const router = express.Router();

router.get("/", obtenerEntrenadores);
router.get("/:id", obtenerEntrenadorPorId);
router.post("/", crearEntrenador);
router.put("/:id", actualizarEntrenador);
router.delete("/:id", eliminarEntrenador);

// 👇 Nueva ruta para equipos
router.get("/equipos/listar", listarEquipos);

module.exports = router;

