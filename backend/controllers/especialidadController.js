const Cliente = require("../models/Cliente");

// Obtener todas las especialidades desde los clientes
const getEspecialidades = async (req, res) => {
  try {
    // Obtiene valores únicos del campo "especialidad" en la colección clientes
    const especialidades = await Cliente.distinct("especialidad");

    // Formatear para que el frontend reciba igual que antes
    const lista = especialidades.map((nombre, i) => ({
      _id: i.toString(),
      nombre,
    }));

    res.json(lista);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener especialidades",
      error: error.message,
    });
  }
};

module.exports = { getEspecialidades };
