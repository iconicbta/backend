const express = require("express");
const router = express.Router();
const { resumenGeneral } = require("../controllers/reportesController");

router.get("/resumen-general", resumenGeneral);

module.exports = router;
