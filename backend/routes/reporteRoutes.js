const express = require("express");
const router = express.Router();
const { resumenGeneral } = require("../controllers/reporteController");

router.get("/resumen-general", resumenGeneral);

module.exports = router;
