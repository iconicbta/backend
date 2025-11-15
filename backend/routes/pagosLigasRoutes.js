// backend/routes/pagosLigasRoutes.js
const express = require("express");
const router = express.Router();
const {
  obtenerMeses,
  crearMes,
  obtenerPagosPorMes,
  registrarPago,
  actualizarValorDiario,
} = require("../controllers/pagosLigasController");
const ConfiguracionPagoLiga = require("../models/ConfiguracionPagoLiga");

// CONFIGURACIÓN
router.get("/configuracion", async (req, res) => {
  try {
    let config = await ConfiguracionPagoLiga.findOne();
    if (!config) config = await ConfiguracionPagoLiga.create({ valorDiario: 8000 });
    res.json(config);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ message: "Error al obtener configuración", error: error.message });
  }
});

router.put("/configuracion", async (req, res) => {
  try {
    const { valorDiario } = req.body;
    if (!valorDiario) return res.status(400).json({ message: "Valor diario requerido" });
    let config = await ConfiguracionPagoLiga.findOne();
    if (!config) {
      config = await ConfiguracionPagoLiga.create({ valorDiario });
    } else {
      config.valorDiario = valorDiario;
      await config.save();
    }
    res.json({ message: "Configuración actualizada", config });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ message: "Error al actualizar configuración", error: error.message });
  }
});

// MESES
router.get("/meses", obtenerMeses);
router.post("/crear-mes", crearMes);

// PAGOS
router.get("/pagos/:mes", obtenerPagosPorMes);
router.post("/pagos", registrarPago);
router.delete("/pagos/:id", async (req, res) => {
  const PagoLigaMes = require("../models/PagoLigaMes");
  try {
    const result = await PagoLigaMes.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Pago no encontrado" });
    res.json({ message: "Pago eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    res.status(500).json({ message: "Error al eliminar pago", error: error.message });
  }
});

// VALOR DIARIO
router.put("/valor-diario", actualizarValorDiario);

module.exports = router;
