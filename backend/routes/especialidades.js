const express = require("express");
const router = express.Router();
const { getEspecialidades, createEspecialidad } = require("../controllers/especialidadController");


// 🚨 Pública (sin token) → para cargar equipos en el frontend
router.get("/", getEspecialidades);

// 🔒 Privada (solo admin) → si luego quieres proteger creación, ponle `protect`
router.post("/", createEspecialidad);

module.exports = router;
