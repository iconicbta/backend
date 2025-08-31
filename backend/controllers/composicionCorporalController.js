const ComposicionCorporal = require("../models/ComposicionCorporal");
const Cliente = require("../models/Cliente");
const Usuario = require("../models/Usuario");
const asyncHandler = require("express-async-handler");

// @desc    Crear una nueva composición corporal
// @route   POST /api/composicion-corporal
// @access  Private (Admin o Entrenador)
exports.crearComposicionCorporal = asyncHandler(async (req, res) => {
  console.log("Iniciando crearComposicionCorporal...");
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

  console.log("Datos recibidos para crear composición:", req.body);
  console.log("Usuario autenticado:", req.user);

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

  const calculatedImc = imc || (peso / Math.pow(altura / 100, 2)).toFixed(2);

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
    creadoPor: req.user._id,
  });

  const nuevaComposicion = await composicion.save();
  console.log("Composición corporal guardada:", nuevaComposicion);
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
  console.log("Iniciando obtenerComposicionesCorporales...");
  const composiciones = await ComposicionCorporal.find()
    .populate("creadoPor", "nombre apellido")
    .lean();
  console.log("Composiciones corporales obtenidas:", composiciones);
  res.json({
    success: true,
    data: composiciones,
  });
});

// @desc    Obtener una composición corporal por ID
// @route   GET /api/composicion-corporal/:id
// @access  Private (Admin)
exports.obtenerComposicionCorporal = asyncHandler(async (req, res) => {
  console.log("Iniciando obtenerComposicionCorporal...");
  const composicion = await ComposicionCorporal.findById(req.params.id)
    .populate("creadoPor", "nombre apellido")
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
  console.log("Iniciando actualizarComposicionCorporal...");
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
    req.user.rol !== "admin" &&
    composicion.creadoPor.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "No tienes permiso para actualizar esta composición",
    });
  }

  if (fecha) {
    const fechaValida = new Date(fecha);
    if (isNaN(fechaValida.getTime())) {
      return res.status(400).json({
        success: false,
        message:
          "El formato de la fecha es inválido. Usa formato ISO (YYYY-MM-DD)",
      });
    }
  }

  if (peso && peso <= 0) {
    return res.status(400).json({
      success: false,
      message: "Peso debe ser un valor positivo",
    });
  }
  if (altura && altura <= 0) {
    return res.status(400).json({
      success: false,
      message: "Altura debe ser un valor positivo",
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

  if (
    numeroIdentificacion &&
    numeroIdentificacion !== composicion.numeroIdentificacion
  ) {
    const cliente = await Cliente.findOne({ numeroIdentificacion });
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado para el nuevo número de identificación",
      });
    }
  }

  const calculatedImc =
    imc || (peso && altura)
      ? (peso / Math.pow(altura / 100, 2)).toFixed(2)
      : composicion.imc;

  composicion.numeroIdentificacion =
    numeroIdentificacion || composicion.numeroIdentificacion;
  composicion.fecha = fecha || composicion.fecha;
  composicion.peso = peso || composicion.peso;
  composicion.altura = altura || composicion.altura;
  composicion.imc = calculatedImc;
  composicion.porcentajeGrasa = porcentajeGrasa || composicion.porcentajeGrasa;
  composicion.porcentajeMusculo =
    porcentajeMusculo || composicion.porcentajeMusculo;
  composicion.notas = notas || composicion.notas;
  composicion.medidas = medidas || composicion.medidas;
  composicion.objetivo = objetivo || composicion.objetivo;

  const composicionActualizada = await composicion.save();
  console.log("Composición corporal actualizada:", composicionActualizada);
  res.json({
    success: true,
    message: "Composición corporal actualizada con éxito",
    composicion: composicionActualizada,
  });
});

// @desc    Eliminar una composición corporal
// @route   DELETE /api/composicion-corporal/:id
// @access  Private (Admin)
exports.eliminarComposicionCorporal = asyncHandler(async (req, res) => {
  console.log("Iniciando eliminarComposicionCorporal...");
  const composicion = await ComposicionCorporal.findById(req.params.id);

  if (!composicion) {
    return res.status(404).json({
      success: false,
      message: "Composición no encontrada",
    });
  }

  if (req.user.rol !== "admin") {
    return res.status(403).json({
      success: false,
      message: "No tienes permiso para eliminar esta composición",
    });
  }

  await composicion.deleteOne();
  res.json({
    success: true,
    message: "Composición corporal eliminada con éxito",
  });
});

// @desc    Consultar composiciones corporales por número de identificación del cliente
// @route   GET /api/composicion-corporal/cliente/:identificacion
// @access  Public (sin permisos)
exports.consultarComposicionesPorCliente = asyncHandler(async (req, res) => {
  console.log("Iniciando consultarComposicionesPorCliente...");
  const { identificacion } = req.params;
  console.log("Consultando composiciones para identificacion:", identificacion);

  if (!identificacion || isNaN(identificacion)) {
    return res.status(400).json({
      success: false,
      message: "Número de identificación inválido",
    });
  }

  const cliente = await Cliente.findOne({
    numeroIdentificacion: identificacion,
  });
  if (!cliente) {
    console.log("Cliente no encontrado para identificacion:", identificacion);
    return res.status(404).json({
      success: false,
      message:
        "Cliente no encontrado para el número de identificación proporcionado",
    });
  }

  const composiciones = await ComposicionCorporal.find({
    numeroIdentificacion: identificacion,
  })
    .populate("creadoPor", "nombre apellido")
    .lean();

  console.log("Composiciones encontradas:", composiciones);

  if (!composiciones || composiciones.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No se encontraron registros para esta identificación.",
    });
  }

  res.json({
    success: true,
    data: composiciones,
  });
});
