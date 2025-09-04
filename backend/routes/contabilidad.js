const express = require("express");
const router = express.Router();
const Contabilidad = require("../models/Contabilidad");
const { protect } = require("../middleware/authMiddleware"); // usando protect

// Listar todas las transacciones
router.get("/", protect, async (req, res) => {
  try {
    console.log("Solicitud GET recibida en /", req.query);

    const { fechaInicio, fechaFin, tipo, metodoPago } = req.query;
    const filtro = {};

    // Filtro por fechas
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      filtro.fecha = { $gte: inicio, $lte: fin };
    } else if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      filtro.fecha = { $gte: inicio };
    } else if (fechaFin) {
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      filtro.fecha = { $lte: fin };
    }

    // Filtro por tipo (ingreso/egreso)
    if (tipo) {
      if (tipo !== "ingreso" && tipo !== "egreso") {
        return res.status(400).json({
          mensaje: "Tipo de transacción inválido. Debe ser 'ingreso' o 'egreso'",
        });
      }
      filtro.tipo = tipo;
    }

    // ✅ Filtro por método de pago
    if (metodoPago) {
      filtro.metodoPago = metodoPago;
    }

    console.log("Filtro aplicado:", JSON.stringify(filtro, null, 2));

    const transacciones = await Contabilidad.find(filtro)
      .populate("creadoPor", "nombre email")
      .sort({ fecha: -1 });

    if (!transacciones) {
      return res.status(404).json({ mensaje: "No se encontraron transacciones" });
    }

    const totalIngresos = transacciones
      .filter((t) => t.tipo === "ingreso")
      .reduce((sum, t) => sum + t.monto, 0);

    const totalEgresos = transacciones
      .filter((t) => t.tipo === "egreso")
      .reduce((sum, t) => sum + t.monto, 0);

    const balance = totalIngresos - totalEgresos;

    res.json({ transacciones, totalIngresos, totalEgresos, balance });
  } catch (error) {
    console.error("Error al listar transacciones:", error.stack);
    res.status(500).json({
      mensaje: "Error interno al listar las transacciones",
      detalle: error.message || "Error desconocido",
    });
  }
});

// Crear una nueva transacción
router.post("/", protect, async (req, res) => {
  try {
    console.log("Solicitud POST recibida en /", JSON.stringify(req.body, null, 2));

    const {
      tipo,
      monto,
      fecha,
      descripcion,
      categoria,
      cuentaDebito,
      cuentaCredito,
      referencia,
      metodoPago, // ✅ añadimos metodoPago aquí también
    } = req.body;

    if (
      !tipo ||
      !monto ||
      !fecha ||
      !descripcion ||
      !cuentaDebito ||
      !cuentaCredito ||
      !referencia
    ) {
      return res.status(400).json({
        mensaje: "Faltan campos requeridos",
        detalle:
          "Asegúrate de enviar tipo, monto, fecha, descripcion, cuentaDebito, cuentaCredito y referencia",
      });
    }

    if (tipo !== "ingreso" && tipo !== "egreso") {
      return res.status(400).json({
        mensaje: "Tipo de transacción inválido",
        detalle: "El tipo debe ser 'ingreso' o 'egreso'",
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado",
        detalle: "No se encontró el ID del usuario en el token",
      });
    }

    const fechaTransaccion = new Date(fecha);
    if (isNaN(fechaTransaccion.getTime())) {
      return res.status(400).json({ mensaje: "Fecha inválida" });
    }

    const nuevaTransaccion = new Contabilidad({
      tipo,
      monto: Number(monto),
      fecha: fechaTransaccion,
      descripcion,
      categoria: categoria || "",
      cuentaDebito,
      cuentaCredito,
      referencia,
      metodoPago: metodoPago || "Efectivo", // ✅ guardamos también metodoPago
      creadoPor: req.user._id,
    });

    const transaccionGuardada = await nuevaTransaccion.save();
    await transaccionGuardada.populate("creadoPor", "nombre email");
    console.log("Transacción guardada:", JSON.stringify(transaccionGuardada, null, 2));
    res.status(201).json(transaccionGuardada);
  } catch (error) {
    console.error("Error al crear transacción:", error.stack);
    res.status(500).json({
      mensaje: "Error interno al crear la transacción",
      detalle: error.message || "Error desconocido",
    });
  }
});

// Obtener una transacción por ID
router.get("/:id", protect, async (req, res) => {
  try {
    console.log("Solicitud GET recibida en /:id", req.params.id);
    const transaccion = await Contabilidad.findById(req.params.id).populate(
      "creadoPor",
      "nombre email"
    );
    if (!transaccion) {
      return res.status(404).json({ mensaje: "Transacción no encontrada" });
    }
    res.status(200).json(transaccion);
  } catch (error) {
    console.error("Error al obtener transacción:", error.stack);
    res.status(500).json({
      mensaje: "Error al obtener la transacción",
      detalle: error.message || "Error desconocido",
    });
  }
});

// Actualizar una transacción
router.put("/:id", protect, async (req, res) => {
  try {
    console.log("Solicitud PUT recibida en /:id", req.params.id, JSON.stringify(req.body, null, 2));
    const {
      tipo,
      monto,
      fecha,
      descripcion,
      categoria,
      cuentaDebito,
      cuentaCredito,
      referencia,
      metodoPago, // ✅ lo incluimos también en la actualización
    } = req.body;

    const transaccion = await Contabilidad.findById(req.params.id);
    if (!transaccion) {
      return res.status(404).json({ mensaje: "Transacción no encontrada" });
    }

    const fechaTransaccion = new Date(fecha);
    if (isNaN(fechaTransaccion.getTime())) {
      return res.status(400).json({ mensaje: "Fecha inválida" });
    }

    transaccion.tipo = tipo;
    transaccion.monto = Number(monto);
    transaccion.fecha = fechaTransaccion;
    transaccion.descripcion = descripcion;
    transaccion.categoria = categoria || "";
    transaccion.cuentaDebito = cuentaDebito;
    transaccion.cuentaCredito = cuentaCredito;
    transaccion.referencia = referencia;
    transaccion.metodoPago = metodoPago || transaccion.metodoPago;
    transaccion.updatedAt = new Date();

    await transaccion.save();
    await transaccion.populate("creadoPor", "nombre email");
    res.json(transaccion);
  } catch (error) {
    console.error("Error al actualizar transacción:", error.stack);
    res.status(500).json({
      mensaje: "Error al actualizar la transacción",
      detalle: error.message || "Error desconocido",
    });
  }
});

// Eliminar una transacción
router.delete("/:id", protect, async (req, res) => {
  try {
    console.log("Solicitud DELETE recibida en /:id", req.params.id);
    const transaccionEliminada = await Contabilidad.findByIdAndDelete(req.params.id);
    if (!transaccionEliminada) {
      return res.status(404).json({ mensaje: "Transacción no encontrada" });
    }
    res.status(200).json({ mensaje: "Transacción eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar transacción:", error.stack);
    res.status(500).json({
      mensaje: "Error al eliminar la transacción",
      detalle: error.message || "Error desconocido",
    });
  }
});

module.exports = router;
