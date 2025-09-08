const Entrenador = require("../models/Entrenador");

// Obtener todos los entrenadores
const obtenerEntrenadores = async (req, res) => {
  try {
    const entrenadores = await Entrenador.find();
    res.json(entrenadores);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener entrenadores", error });
  }
};

// Obtener un entrenador por ID
const obtenerEntrenadorPorId = async (req, res) => {
  try {
    const entrenador = await Entrenador.findById(req.params.id);
    if (!entrenador) {
      return res.status(404).json({ message: "Entrenador no encontrado" });
    }
    res.json(entrenador);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener entrenador", error });
  }
};

// Crear un entrenador
const crearEntrenador = async (req, res) => {
  try {
    const nuevoEntrenador = new Entrenador(req.body);
    await nuevoEntrenador.save();
    res.status(201).json(nuevoEntrenador);
  } catch (error) {
    res.status(500).json({ message: "Error al crear entrenador", error });
  }
};

// Actualizar un entrenador
const actualizarEntrenador = async (req, res) => {
  try {
    const entrenadorActualizado = await Entrenador.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!entrenadorActualizado) {
      return res.status(404).json({ message: "Entrenador no encontrado" });
    }
    res.json(entrenadorActualizado);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar entrenador", error });
  }
};

// Eliminar un entrenador
const eliminarEntrenador = async (req, res) => {
  try {
    const entrenadorEliminado = await Entrenador.findByIdAndDelete(req.params.id);
    if (!entrenadorEliminado) {
      return res.status(404).json({ message: "Entrenador no encontrado" });
    }
    res.json({ message: "Entrenador eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar entrenador", error });
  }
};

// 👇 Nuevo: listar equipos
const listarEquipos = async (req, res) => {
  try {
    const equipos = await Entrenador.distinct("equipo");
    res.json(equipos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener equipos", error });
  }
};

module.exports = {
  obtenerEntrenadores,
  obtenerEntrenadorPorId,
  crearEntrenador,
  actualizarEntrenador,
  eliminarEntrenador,
  listarEquipos, // 👈 exportado correctamente
};
