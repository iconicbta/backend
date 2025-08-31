const Membresia = require("../models/Membresia");

// Obtener todas las membresías
const obtenerMembresias = async (req, res) => {
  try {
    const membresias = await Membresia.find().populate(
      "cliente",
      "nombre apellido"
    );
    res.status(200).json({ membresias });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una nueva membresía
const crearMembresia = async (req, res) => {
  try {
    const { fechainicio, duracion } = req.body;
    const nuevaMembresia = new Membresia(req.body);

    // Calcular fechafin si se proporcionan fechainicio y duracion
    if (fechainicio && duracion) {
      const inicio = new Date(fechainicio);
      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + parseInt(duracion));
      nuevaMembresia.fechafin = fin;
    }

    const membresiaGuardada = await nuevaMembresia.save();
    await membresiaGuardada.populate("cliente", "nombre apellido");
    res.status(201).json(membresiaGuardada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener una membresía por ID
const obtenerMembresiaPorId = async (req, res) => {
  try {
    const membresia = await Membresia.findById(req.params.id).populate(
      "cliente",
      "nombre apellido"
    );
    if (!membresia) {
      return res.status(404).json({ mensaje: "Membresía no encontrada" });
    }
    res.status(200).json(membresia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una membresía
const actualizarMembresia = async (req, res) => {
  try {
    const { fechainicio, duracion } = req.body;
    const membresia = await Membresia.findById(req.params.id);

    if (!membresia) {
      return res.status(404).json({ mensaje: "Membresía no encontrada" });
    }

    // Actualizar los campos
    Object.assign(membresia, req.body);

    // Recalcular fechafin si se actualizan fechainicio o duracion
    if (fechainicio && duracion) {
      const inicio = new Date(fechainicio);
      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + parseInt(duracion));
      membresia.fechafin = fin;
    }

    const membresiaActualizada = await membresia.save();
    await membresiaActualizada.populate("cliente", "nombre apellido");
    res.status(200).json(membresiaActualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar una membresía
const eliminarMembresia = async (req, res) => {
  try {
    const membresia = await Membresia.findByIdAndDelete(req.params.id);
    if (!membresia) {
      return res.status(404).json({ mensaje: "Membresía no encontrada" });
    }
    res.status(200).json({ mensaje: "Membresía eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerMembresias,
  crearMembresia,
  obtenerMembresiaPorId,
  actualizarMembresia,
  eliminarMembresia,
};
