const express = require("express");
const router = express.Router();
const {
  obtenerMeses,
  crearMes,
  obtenerPagosPorMes,
  registrarPagoMes
} = require("../controllers/pagaMesController");
const PagaMes = require("../models/pagaMesModels");

router.get("/meses", obtenerMeses);
router.post("/crear-mes", crearMes);
router.get("/pagos/:mes", obtenerPagosPorMes);
router.post("/pagos", registrarPagoMes);

// Eliminar un pago específico
router.delete("/pagos/:id", async (req, res) => {
  try {
    await PagaMes.findByIdAndDelete(req.params.id);
    res.json({ message: "Pago eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
});

module.exports = router;
