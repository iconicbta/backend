const Entrenador = require("../models/Entrenador");

// Listar entrenadores
const listarEntrenadores = async (req, res) => {
  try {
    const entrenadores = await Entrenador.find().sort({ createdAt: -1 });
    res.json(entrenadores);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al listar entrenadores",
      detalle: error.message,
    });
  }
};

// Nuevo: listar todos los equipos
const listarEquipos = async (req, res) => {
  try {
    const entrenadores = await Entrenador.find({}, "clases.nombreClase");
    let equipos = [];
    entrenadores.forEach((ent) => {
      ent.clases.forEach((cl) => {
        if (cl.nombreClase) {
          equipos.push(cl.nombreClase);
        }
      });
    });
    res.json(equipos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al listar equipos",
      detalle: error.message,
    });
  }
};

module.exports = {
  listarEntrenadores,
  listarEquipos,
};
