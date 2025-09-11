const Especialidad = require("../models/Especialidad");

// Obtener todas las especialidades (equipos)
const getEspecialidades = async (req, res) => {
  try {
    const especialidades = await Especialidad.find().sort({ nombre: 1 });
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener especialidades", error: error.message });
  }
};

// Crear una especialidad nueva
const createEspecialidad = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ mensaje: "El nombre es obligatorio" });
    }
    const nueva = new Especialidad({ nombre });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear especialidad", error: error.message });
  }
};

module.exports = { getEspecialidades, createEspecialidad };

