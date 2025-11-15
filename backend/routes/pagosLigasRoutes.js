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

// Modelos
const PagoLigaMes = require("../models/PagoLigaMes");
const MesLiga = require("../models/MesLiga");
const ConfiguracionPagoLiga = require("../models/ConfiguracionPagoLiga");

// CONFIGURACIÓN
router.get("/configuracion", async (req, res) => {
  try {
    let config = await ConfiguracionPagoLiga.findOne();
    if (!config) config = await ConfiguracionPagoLiga.create({ valorDiario: 8000 });
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener configuración", error });
  }
});

router.put("/configuracion", async (req, res) => {
  try {
    const { valorDiario } = req.body;
    let config = await ConfiguracionPagoLiga.findOne();
    if (!config) {
      config = await ConfiguracionPagoLiga.create({ valorDiario });
    } else {
      config.valorDiario = valorDiario;
      await config.save();
    }
    res.json({ message: "Configuración actualizada", config });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar configuración", error });
  }
});

// MESES
router.get("/meses", obtenerMeses);
router.post("/crear-mes", crearMes);

// PAGOS
router.get("/pagos/:mes", obtenerPagosPorMes);
router.post("/pagos", registrarPago); // Cambiado: ahora recibe mes en body
router.delete("/pagos/:id", async (req, res) => {
  try {
    await PagoLigaMes.findByIdAndDelete(req.params.id);
    res.json({ message: "Pago eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar", error });
  }
});

// VALOR DIARIO
router.put("/valor-diario", actualizarValorDiario);

module.exports = router;
