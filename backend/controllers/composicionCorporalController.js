const ComposicionCorporal = require("../models/ComposicionCorporal");
const Cliente = require("../models/Cliente");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc    Crear una nueva composición corporal
// @route   POST /api/composicion-corporal
// @access  Private (Admin o Entrenador)
exports.crearComposicionCorporal = asyncHandler(async (req, res) => {
  const {
    numeroIdentificacion,
    fecha,
    peso,
    altura,
    imc,
    porcentajeGrasa,
    porcentajeMusculo,
    notas,
    medidas,
    objetivo,
  } = req.body;

  if (!numeroIdentificacion || !fecha || !peso || !altura) {
    return res.status(400).json({
      success: false,
      message:
        "Faltan campos requeridos: numeroIdentificacion, fecha, peso y altura son obligatorios",
    });
  }

  const fechaValida = new Date(fecha);
  if (isNaN(fechaValida.getTime())) {
    return res.status(400).json({
      success: false,
      message:
        "El formato de la fecha es inválido. Usa formato ISO (YYYY-MM-DD)",
    });
  }

  if (peso <= 0 || altura <= 0) {
    return res.status(400).json({
      success: false,
      message: "Peso y altura deben ser valores positivos",
    });
  }

  if (porcentajeGrasa && (porcentajeGrasa < 0 || porcentajeGrasa > 100)) {
    return res.status(400).json({
      success: false,
      message: "El porcentaje de grasa debe estar entre 0 y 100",
    });
  }
  if (porcentajeMusculo && (porcentajeMusculo < 0 || porcentajeMusculo > 100)) {
    return res.status(400).json({
      success: false,
      message: "El porcentaje de músculo debe estar entre 0 y 100",
    });
  }

  const cliente = await Cliente.findOne({ numeroIdentificacion });
  if (!cliente) {
    return res.status(404).json({
      success: false,
      message:
        "Cliente no encontrado para el número de identificación proporcionado",
    });
  }

  const calculatedImc =
    imc || parseFloat((peso / Math.pow(altura / 100, 2)).toFixed(2));

  const composicion = new ComposicionCorporal({
    numeroIdentificacion,
    fecha,
    peso,
    altura,
    imc: calculatedImc,
    porcentajeGrasa: porcentajeGrasa || 0,
    porcentajeMusculo: porcentajeMusculo || 0,
    notas: notas || "",
    medidas: medidas || {},
    objetivo: objetivo || "",
    creadoPor: req.user ? req.user._id : null,
  });

  const nuevaComposicion = await composicion.save();
  res.status(201).json({
    success: true,
    message: "Composición corporal creada con éxito",
    composicion: nuevaComposicion,
  });
});

// @desc    Obtener todas las composiciones corporales
// @route   GET /api/composicion-corporal
// @access  Private (Admin)
exports.obtenerComposicionesCorporales = asyncHandler(async (req, res) => {
  const composiciones = await ComposicionCorporal.find()
    .populate("creadoPor", "nombre email")
    .lean();
  res.json({
    success: true,
    data: composiciones,
  });
});

// @desc    Obtener una composición corporal por ID
// @route   GET /api/composicion-corporal/:id
// @access  Private (Admin)
exports.obtenerComposicionCorporal = asyncHandler(async (req, res) => {
  const composicion = await ComposicionCorporal.findById(req.params.id)
    .populate("creadoPor", "nombre email")
    .lean();

  if (!composicion) {
    return res.status(404).json({
      success: false,
      message: "Composición no encontrada",
    });
  }

  res.json({
    success: true,
    data: composicion,
  });
});

// @desc    Actualizar una composición corporal
// @route   PUT /api/composicion-corporal/:id
// @access  Private (Admin o Entrenador que la creó)
exports.actualizarComposicionCorporal = asyncHandler(async (req, res) => {
  const {
    numeroIdentificacion,
    fecha,
    peso,
    altura,
    imc,
    porcentajeGrasa,
    porcentajeMusculo,
    notas,
    medidas,
    objetivo,
  } = req.body;

  const composicion = await ComposicionCorporal.findById(req.params.id);
  if (!composicion) {
    return res.status(404).json({
      success: false,
      message: "Composición no encontrada",
    });
  }

  if (
    req.user?.rol !== "admin" &&
    composicion.creadoPor.toString() !== req.user?._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "No tienes permiso para actualizar esta compos
