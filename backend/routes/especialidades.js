const express = require("express");
const router = express.Router();
const { getEspecialidades } = require("../controllers/especialidadController");

// Solo GET porque ya se crean en clientes
router.get("/", getEspecialidades);

module.exports = router;
