// backend/controllers/pagosLigasController.js
const PagoLigaMes = require("../models/PagoLigaMes");
const ConfiguracionPagoLiga = require("../models/ConfiguracionPagoLiga);

// OBTENER MESES (ahora ordenados correctamente)
const obtenerMeses = async (req, res) => {
  try {
    const meses = await PagoLigaMes.distinct("mes");

    // Ordenar meses cronológicamente (de más reciente a más antiguo)
    const mesesOrdenados = meses.sort((a, b) => {
      const [mesA, añoA] = a.split(" ");
      const [mesB, añoB] = b.split(" ");
      const dateA = new Date(`${mesA} 1, ${añoA}`);
      const dateB = new Date(`${mesB} 1, ${añoB}`);
      return dateB - dateA; // Más reciente primero
    });

    res.json(mesesOrdenados.map(m => ({ _id: m, nombre: m })));
  } catch (error) {
    console.error("Error al obtener meses:", error);
    res.status(500).json({ message: "Error al obtener meses" });
  }
};

// CREAR MES → AHORA SÍ SE GUARDA EN LA BASE DE DATOS
const crearMes = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "Nombre del mes requerido" });
    }

    const nombreMes = nombre.trim();

    // Verificar si ya existe
    const existe = await PagoLigaMes.findOne({ mes: nombreMes });
    if (existe) {
      return res.status(400).json({ message: "El mes ya existe" });
    }

    // CREAR UN REGISTRO FICTICIO PARA QUE EL MES APAREZCA EN LA LISTA
    const registroMes = new PagoLigaMes({
      nombre: "SYSTEM_CREATED_MONTH",     // Nombre ficticio
      equipo: "Ligas",
      mes: nombreMes,
      diasAsistidos: 0,
      total: 0,
      valorDiarioUsado: 8000,
      diasPagados: [],
    });

    await registroMes.save();

    res.json({ 
      message: "Mes creado correctamente", 
      nombre: nombreMes 
    });
  } catch (error) {
    console.error("Error al crear mes:", error);
    res.status(500).json({ message: "Error al crear mes" });
  }
};

// OBTENER PAGOS POR MES (sin cambios, funciona perfecto)
const obtenerPagosPorMes = async (req, res) => {
  try {
    const { mes } = req.params;
    const pagos = await PagoLigaMes.find({ mes })
      .sort({ createdAt: -1 });

    // Filtrar el registro ficticio "SYSTEM_CREATED_MONTH" para que no aparezca en la tabla
    const pagosReales = pagos.filter(p => p.nombre !== "SYSTEM_CREATED_MONTH");

    res.json(pagosReales);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    res.status(500).json({ message: "Error al obtener pagos" });
  }
};

// REGISTRAR PAGO (ya estaba perfecto)
const registrarPago = async (req, res) => {
  try {
    const {
      nombre,
      equipo = "Ligas",
      mes,
      diasAsistidos,
      total,
      valorDiarioUsado,
      diasPagados = []
    } = req.body;

    if (!nombre || !mes || !diasAsistidos || !total) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    const nuevoPago = new PagoLigaMes({
      nombre: nombre.trim().toUpperCase(),
      equipo,
      mes,
      diasAsistidos,
      total,
      valorDiarioUsado: valorDiarioUsado || total / diasAsistidos,
      diasPagados,
    });

    await nuevoPago.save();
    res.status(201).json(nuevoPago);
  } catch (error) {
    console.error("Error al registrar pago:", error);
    res.status(500).json({ message: "Error al registrar pago" });
  }
};

// ACTUALIZAR VALOR DIARIO
const actualizarValorDiario = async (req, res) => {
  try {
    const { valor } = req.body;
    if (!valor || valor <= 0) return res.status(400).json({ message: "Valor inválido" });

    let config = await ConfiguracionPagoLiga.findOne();
    if (!config) {
      config = new ConfiguracionPagoLiga({ valorDiario: valor });
    } else {
      config.valorDiario = valor;
    }
    await config.save();

    res.json({ message: "Valor diario actualizado", valorDiario: config.valorDiario });
  } catch (error) {
    console.error("Error al actualizar valor diario:", error);
    res.status(500).json({ message: "Error al actualizar valor diario" });
  }
};

module.exports = {
  obtenerMeses,
  crearMes,
  obtenerPagosPorMes,
  registrarPago,
  actualizarValorDiario,
};
