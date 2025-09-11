const Cliente = require("../models/Cliente");

// Obtener lista única de especialidades desde los clientes
const getEspecialidades = async (req, res) => {
  try {
    const especialidades = await Cliente.distinct("especialidad");
    res.json(
      especialidades.map((nombre, i) => ({
        _id: i.toString(), // solo para que el frontend pueda usar "key"
        nombre,
      }))
    );
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener especialidades",
      error: error.message,
    });
  }
};

module.exports = { getEspecialidades };
