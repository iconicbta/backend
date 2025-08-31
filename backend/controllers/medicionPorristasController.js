const MedicionPorristas = require("../models/MedicionPorristas");
const Entrenador = require("../models/Entrenador");
const Cliente = require("../models/Cliente");
const asyncHandler = require("express-async-handler");

// @desc    Crear una nueva medición de porristas
// @route   POST /api/medicion-porristas
// @access  Private (Admin, Entrenador)
exports.crearMedicionPorristas = asyncHandler(async (req, res) => {
  const { clienteId, entrenadorId, equipo, categoria, posicion, ejercicios, descripcion } = req.body;

  if (!clienteId || !entrenadorId || !equipo || !categoria || !posicion || !ejercicios || ejercicios.length === 0) {
    return res.status(400).json({
      mensaje: "Faltan campos requeridos: clienteId, entrenadorId, equipo, categoria, posicion y ejercicios son obligatorios",
    });
  }

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      mensaje: "No autorizado: Usuario no autenticado o ID no disponible",
    });
  }

  const [cliente, entrenador] = await Promise.all([
    Cliente.findById(clienteId),
    Entrenador.findById(entrenadorId),
  ]);

  if (!cliente) {
    return res.status(404).json({ mensaje: "Cliente no encontrado" });
  }
  if (!entrenador) {
    return res.status(404).json({ mensaje: "Entrenador no encontrado" });
  }

  const nuevaMedicion = new MedicionPorristas({
    clienteId,
    entrenadorId,
    equipo,
    categoria,
    posicion,
    ejercicios,
    descripcion,
    creadoPor: req.user._id,
  });

  const medicionCreada = await nuevaMedicion.save();
  res.status(201).json({ mensaje: "Medición creada con éxito", medicion: medicionCreada });
});

// @desc    Listar todas las mediciones de porristas
// @route   GET /api/medicion-porristas
// @access  Private (Admin, Entrenador)
exports.listarMedicionesPorristas = asyncHandler(async (req, res) => {
  const mediciones = await MedicionPorristas.find().populate("clienteId", "nombre apellido").populate("entrenadorId", "nombre apellido especialidad").populate("creadoPor", "nombre apellido");
  res.json(mediciones);
});

// @desc    Actualizar una medición de porristas
// @route   PUT /api/medicion-porristas/:id
// @access  Private (Admin)
exports.actualizarMedicionPorristas = asyncHandler(async (req, res) => {
  const { clienteId, entrenadorId, equipo, categoria, posicion, ejercicios, descripcion } = req.body;

  if (!clienteId || !entrenadorId || !equipo || !categoria || !posicion || !ejercicios || ejercicios.length === 0) {
    return res.status(400).json({
      mensaje: "Faltan campos requeridos: clienteId, entrenadorId, equipo, categoria, posicion y ejercicios son obligatorios",
    });
  }

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      mensaje: "No autorizado: Usuario no autenticado o ID no disponible",
    });
  }

  const [cliente, entrenador] = await Promise.all([
    Cliente.findById(clienteId),
    Entrenador.findById(entrenadorId),
  ]);

  if (!cliente) {
    return res.status(404).json({ mensaje: "Cliente no encontrado" });
  }
  if (!entrenador) {
    return res.status(404).json({ mensaje: "Entrenador no encontrado" });
  }

  const medicionActualizada = await MedicionPorristas.findByIdAndUpdate(
    req.params.id,
    {
      clienteId,
      entrenadorId,
      equipo,
      categoria,
      posicion,
      ejercicios,
      descripcion,
      creadoPor: req.user._id,
    },
    { new: true, runValidators: true }
  );

  if (!medicionActualizada) {
    return res.status(404).json({ mensaje: "Medición no encontrada" });
  }

  res.json({
    mensaje: "Medición actualizada con éxito",
    medicion: medicionActualizada,
  });
});

// @desc    Eliminar una medición de porristas
// @route   DELETE /api/medicion-porristas/:id
// @access  Private (Admin)
exports.eliminarMedicionPorristas = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      mensaje: "No autorizado: Usuario no autenticado o ID no disponible",
    });
  }

  const medicion = await MedicionPorristas.findById(req.params.id);
  if (!medicion) {
    return res.status(404).json({ mensaje: "Medición no encontrada" });
  }

  await MedicionPorristas.deleteOne({ _id: req.params.id });
  res.json({ mensaje: "Medición eliminada con éxito" });
});
