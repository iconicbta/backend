const express = require("express");
const router = express.Router();
const { obtenerEspecialidades, crearEspecialidad } = require("../controllers/especialidadesController");

router.get("/", obtenerEspecialidades);
router.post("/", crearEspecialidad);

module.exports = router;
