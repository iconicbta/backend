const mongoose = require("mongoose");
const Entrenador = require("../models/Entrenador");

// Listar todos los entrenadores
const listarEntrenadores = async (req, res) => {
  try {
    console.log("Iniciando listarEntrenadores...");
    const entrenadores = await Entrenador.find().sort({ createdAt: -1 });
    console.log("Entrenadores encontrados:", entrenadores);
    res.json(entrenadores);
  } catch (error) {
    console.error("Error al listar entrenadores:", error.message);
    res.status(500).json({
      mensaje: "Error al listar entrenadores",
      detalle: error.message,
    });
  }
};

// Agregar un nuevo entrenador
const agregarEntrenador = async (req, res) => {
  try {
    console.log("Iniciando agregarEntrenador...");
    console.log("Datos recibidos:", req.body);
    console.log("Usuario autenticado:", req.user);

    const { nombre, apellido, correo, telefono, especialidad, clases } = req.body;

    if (!nombre || !apellido || !correo) {
      return res
        .status(400)
        .json({ mensaje: "Nombre, apellido y correo son requeridos" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ mensaje: "Usuario no autenticado" });
    }

    const entrenador = new Entrenador({
      nombre,
      apellido,
      correo,
      telefono,
      especialidad,
      clases: clases || [{ nombreClase: "", dias: [], capacidadMaxima: 10 }],
      creadoPor: req.user._id,
    });

    const savedEntrenador = await entrenador.save();
    console.log("Entrenador guardado:", savedEntrenador);
    res.status(201).json(savedEntrenador);
  } catch (error) {
    console.error("Error al agregar entrenador:", error.message, error.stack);
    res.status(500).json({
      mensaje: "Error al agregar entrenador",
      detalle: error.message,
      stack: error.stack,
    });
  }
};

// Obtener un entrenador por ID
const obtenerEntrenadorPorId = async (req, res) => {
  try {
    console.log("Iniciando obtenerEntrenadorPorId...");
    const entrenador = await Entrenador.findById(req.params.id).lean();
    if (!entrenador) {
      console.log("Entrenador no encontrado para el ID:", req.params.id);
      return res.status(404).json({ mensaje: "Entrenador no encontrado" });
    }
    // Asegurarse de que las clases estén completamente resueltas
    console.log("Entrenador encontrado:", entrenador);
    res.json(entrenador);
  } catch (error) {
    console.error("Error al obtener entrenador:", error.message);
    res.status(500).json({
      mensaje: "Error al obtener entrenador",
      detalle: error.message,
    });
  }
};

// Editar un entrenador existente
const editarEntrenador = async (req, res) => {
  try {
    console.log("Iniciando editarEntrenador...");
    console.log("Datos recibidos para editar:", req.body);
    const { nombre, apellido, correo, telefono, especialidad, clases } = req.body;

    const entrenador = await Entrenador.findById(req.params.id);
    if (!entrenador) {
      console.log("Entrenador no encontrado para el ID:", req.params.id);
      return res.status(404).json({ mensaje: "Entrenador no encontrado" });
    }

    const updatedEntrenador = await Entrenador.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        apellido,
        correo,
        telefono,
        especialidad,
        clases: clases || entrenador.clases, // Mantener clases existentes si no se envían nuevas
        updatedAt: new Date(),
      },
      { new: true, runValidators: true, lean: true }
    );

    console.log("Entrenador actualizado:", updatedEntrenador);
    res.json(updatedEntrenador);
  } catch (error) {
    console.error(
      "Error al actualizar entrenador:",
      error.message,
      error.stack
    );
    res.status(500).json({
      mensaje: "Error al actualizar entrenador",
      detalle: error.message,
      stack: error.stack,
    });
  }
};

// Eliminar un entrenador
const eliminarEntrenador = async (req, res) => {
  try {
    console.log("Iniciando eliminarEntrenador...");
    const entrenador = await Entrenador.findById(req.params.id);
    if (!entrenador) {
      console.log("Entrenador no encontrado para el ID:", req.params.id);
      return res.status(404).json({ mensaje: "Entrenador no encontrado" });
    }

    await Entrenador.findByIdAndDelete(req.params.id);
    console.log("Entrenador eliminado:", entrenador);
    res.json({ mensaje: "Entrenador eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar entrenador:", error.message);
    res.status(500).json({
      mensaje: "Error al eliminar entrenador",
      detalle: error.message,
    });
  }
};

module.exports = {
  listarEntrenadores,
  agregarEntrenador,
  obtenerEntrenadorPorId,
  editarEntrenador,
  eliminarEntrenador,
};
