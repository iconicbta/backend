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
const auth = require("../middleware/auth"); // ← Asegúrate de tener este middleware

// CONFIGURACIÓN VALOR DIARIO
router.get("/configuracion", async (req, res) => {
  try {
    let config = await ConfiguracionPagoLiga.findOne();
    if (!config) config = await ConfiguracionPagoLiga.create({ valorDiario: 8000 });
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener configuración" });
  }
});

router.put("/configuracion", async (req, res) => {
  try {
    const { valorDiario } = req.body;
    let config = await ConfiguracionPagoLiga.findOne();
    if (!config) config = await ConfiguracionPagoLiga.create({ valorDiario });
    else config.valorDiario = valorDiario;
    await config.save();
    res.json({ message: "Configuración actualizada", config });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar configuración" });
  }
});

// RUTAS PRINCIPALES
router.get("/meses", auth, obtenerMeses);
router.post("/crear-mes", auth, crearMes);
router.get("/pagos/:mes", auth, obtenerPagosPorMes);
router.post("/pagos", auth, registrarPago);                    // ← AHORA GUARDA diasPagados
router.delete("/pagos/:id", auth, async (req, res) => {
  const PagoLigaMes = require("../models/PagoLigaMes");
  try {
    const result = await PagoLigaMes.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "Pago no encontrado" });
    res.json({ message: "Pago eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar" });
  }
});

router.put("/valor-diario", auth, actualizarValorDiario);

module.exports = router;
