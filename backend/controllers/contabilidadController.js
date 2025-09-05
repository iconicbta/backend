const Transaccion = require("../models/Transaccion");

// Crear una nueva transacción (protegida)
const crearTransaccion = async (req, res) => {
  try {
    const { tipo, concepto, monto, fecha, metodoPago } = req.body;
    console.log("Datos recibidos para crear transacción:", req.body); // Depuración

    if (!tipo || !concepto || !monto || !fecha) {
      return res
        .status(400)
        .json({ mensaje: "Tipo, concepto, monto y fecha son obligatorios" });
    }

    if (!["ingreso", "egreso"].includes(tipo.toLowerCase())) {
      return res
        .status(400)
        .json({ mensaje: "Tipo debe ser 'ingreso' o 'egreso'" });
    }

    const nuevaTransaccion = new Transaccion({
      tipo: tipo.toLowerCase(),
      concepto,
      monto,
      fecha: new Date(fecha),
      metodoPago: metodoPago || "Efectivo", // <-- usar mayúscula consistente
      creadoPor: req.user.id,
    });

    const transaccionGuardada = await nuevaTransaccion.save();
    console.log("Transacción guardada:", transaccionGuardada);

    res.status(201).json({
      mensaje: "Transacción creada con éxito",
      transaccion: transaccionGuardada,
    });
  } catch (error) {
    console.error("Error al crear transacción:", error);
    res
      .status(500)
      .json({ mensaje: "Error al crear transacción", error: error.message });
  }
};

// Listar transacciones (protegida)
const listarTransacciones = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo, metodoPago } = req.query;
    console.log("Parámetros recibidos:", req.query);

    const query = {};

    if (fechaInicio && fechaFin) {
      query.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin),
      };
    }

    if (tipo) {
      query.tipo = tipo.toLowerCase();
    }

    if (tipo === "ingreso" && metodoPago && metodoPago !== "Todos") {
      query.metodoPago = metodoPago;
    }

    console.log("Consulta a ejecutar:", query);
    const transacciones = await Transaccion.find(query).populate(
      "creadoPor",
      "nombre"
    );

    console.log("Transacciones encontradas:", transacciones);

    const totalIngresos = transacciones
      .filter((t) => t.tipo === "ingreso")
      .reduce((sum, t) => sum + t.monto, 0);

    const totalEgresos = transacciones
      .filter((t) => t.tipo === "egreso")
      .reduce((sum, t) => sum + t.monto, 0);

    const balance = totalIngresos - totalEgresos;

    // ✅ Ajustamos la salida al formato que espera el frontend
    res.json({
      transacciones,
      totales: {
        ingresos: totalIngresos,
        egresos: totalEgresos,
        balance,
      },
    });
  } catch (error) {
    console.error("Error al listar transacciones:", error);
    res
      .status(500)
      .json({ mensaje: "Error al listar transacciones", error: error.message });
  }
};

module.exports = {
  crearTransaccion,
  listarTransacciones,
};
