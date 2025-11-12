// backend/routes/pagosLigasRoutes.js
const express = require("express");
const router = express.Router();
const PagoLigaMes = require("../models/PagoLigaMes");
const ConfiguracionPagoLiga = require("../models/ConfiguracionPagoLiga");

/* ===========================
   🔹 Configuración Global
=========================== */

// Obtener valor actual del día
router.get("/configuracion", async (req, res) => {
  try {
    let config = await ConfiguracionPagoLiga.findOne();
    if (!config) {
      config = await ConfiguracionPagoLiga.create({ valorDiario: 8000 });
    }
    res.json(config);
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ message: "Error al obtener configuración", error });
  }
});

// Actualizar valor diario
router.put("/configuracion", async (req, res) => {
  try {
    const { valorDiario, actualizadoPor } = req.body;
    let config = await ConfiguracionPagoLiga.findOne();
    if (!config) {
      config = await ConfiguracionPagoLiga.create({ valorDiario });
    } else {
      config.valorDiario = valorDiario;
      config.actualizadoPor = actualizadoPor || "admin";
      await config.save();
    }
    res.json({ message: "Configuración actualizada", config });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ message: "Error al actualizar configuración", error });
  }
});

/* ===========================
   🔹 Pagos de Liga
=========================== */

// Crear o registrar pago mensual
router.post("/", async (req, res) => {
  try {
    const { nombre, equipo, mes, diasAsistidos } = req.body;

    const config = await ConfiguracionPagoLiga.findOne();
    const valorDiario = config?.valorDiario || 8000;
    const total = diasAsistidos * valorDiario;

    const pago = await PagoLigaMes.create({
      nombre,
      equipo,
      mes,
      diasAsistidos,
      total,
      valorDiarioUsado: valorDiario,
    });

    res.json({ message: "Pago de liga registrado", pago });
  } catch (error) {
    console.error("Error al registrar pago:", error);
    res.status(500).json({ message: "Error al registrar pago", error });
  }
});

// Obtener todos los pagos
router.get("/", async (req, res) => {
  try {
    const pagos = await PagoLigaMes.find().sort({ createdAt: -1 });
    res.json(pagos);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    res.status(500).json({ message: "Error al obtener pagos", error });
  }
});

// Eliminar un pago
router.delete("/:id", async (req, res) => {
  try {
    await PagoLigaMes.findByIdAndDelete(req.params.id);
    res.json({ message: "Pago eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    res.status(500).json({ message: "Error al eliminar pago", error });
  }
});

module.exports = router;
