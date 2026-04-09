const express = require("express");
const router = express.Router();
const { resumenGeneral, cierreDiario } = require("../controllers/reportesController");

router.get("/resumen-general", resumenGeneral);
router.get("/cierre-diario", cierreDiario);
router.get("/diagnostico", diagnostico);

module.exports = router;
