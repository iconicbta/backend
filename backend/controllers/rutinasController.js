const Rutina = require("../models/Rutina");
const RutinaAsignada = require("../models/RutinaAsignada");
const Cliente = require("../models/Cliente");
const asyncHandler = require("express-async-handler");

// @desc    Crear una nueva rutina
// @route   POST /api/rutinas
// @access  Private (Admin)
exports.crearRutina = asyncHandler(async (req, res) => {
  const { grupoMuscular, nombreEjercicio, series, repeticiones, descripcion } =
    req.body;

  console.log("Creando rutina - Paso 1: Datos recibidos:", req.body);
  console.log("Creando rutina - Paso 2: Usuario autenticado:", req.user);

  // Validar campos requeridos
  if (!grupoMuscular || !nombreEjercicio || !series || !repeticiones) {
    console.log("Error: Faltan campos requeridos");
    return res.status(400).json({
      mensaje:
        "Faltan campos requeridos: grupoMuscular, nombreEjercicio, series y repeticiones son obligatorios",
    });
  }

  // Validar que req.user exista
  console.log("Creando rutina - Paso 3: Verificando usuario:", req.user);
  console.log(
    "Creando rutina - Paso 3.5: Estado final de req.user antes de validación:",
    req.user
  );
  if (!req.user || !req.user._id) {
    console.log(
      "Error: Usuario no autenticado o ID no disponible - Detalle:",
      req.user
    );
    return res.status(401).json({
      mensaje: "No autorizado: Usuario no autenticado o ID no disponible",
    });
  }

  console.log(
    "Creando rutina - Paso 4: Preparando nueva rutina con creadoPor:",
    req.user._id
  );
  const nuevaRutina = new Rutina({
    grupoMuscular,
    nombreEjercicio,
    series,
    repeticiones,
    descripcion,
    creadoPor: req.user._id,
  });

  console.log(
    "Creando rutina - Paso 5: Validando modelo antes de guardar:",
    nuevaRutina.validateSync()
  );
  console.log(
    "Creando rutina - Paso 6: Guardando rutina en la base de datos..."
  );
  const rutinaCreada = await nuevaRutina.save();
  console.log("Creando rutina - Paso 7: Rutina guardada:", rutinaCreada);
  res
    .status(201)
    .json({ mensaje: "Rutina creada con éxito", rutina: rutinaCreada });
});

// @desc    Listar todas las rutinas
// @route   GET /api/rutinas
// @access  Private (Admin, Entrenador)
exports.listarRutinas = asyncHandler(async (req, res) => {
  const rutinas = await Rutina.find().populate({
    path: "creadoPor",
    select: "nombre",
    strictPopulate: false,
  });
  res.json(rutinas);
});

// @desc    Actualizar una rutina
// @route   PUT /api/rutinas/:id
// @access  Private (Admin)
exports.actualizarRutina = asyncHandler(async (req, res) => {
  const { grupoMuscular, nombreEjercicio, series, repeticiones, descripcion } =
    req.body;

  // Validar campos requeridos
  if (!grupoMuscular || !nombreEjercicio || !series || !repeticiones) {
    return res.status(400).json({
      mensaje:
        "Faltan campos requeridos: grupoMuscular, nombreEjercicio, series y repeticiones son obligatorios",
    });
  }

  // Validar que req.user exista
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      mensaje: "No autorizado: Usuario no autenticado o ID no disponible",
    });
  }

  const rutinaActualizada = await Rutina.findByIdAndUpdate(
    req.params.id,
    {
      grupoMuscular,
      nombreEjercicio,
      series,
      repeticiones,
      descripcion,
      creadoPor: req.user._id,
    },
    { new: true }
  );

  if (!rutinaActualizada) {
    return res.status(404).json({ mensaje: "Rutina no encontrada" });
  }

  res.json({
    mensaje: "Rutina actualizada con éxito",
    rutina: rutinaActualizada,
  });
});

// @desc    Asignar una rutina a un cliente
// @route   POST /api/rutinas/asignar
// @access  Private (Admin, Entrenador)
exports.asignarRutina = asyncHandler(async (req, res) => {
  const { clienteId, rutinaId, diasEntrenamiento, diasDescanso } = req.body;

  // Validar campos requeridos
  if (!clienteId || !rutinaId || !diasEntrenamiento || !diasDescanso) {
    return res.status(400).json({
      mensaje:
        "Faltan campos requeridos: clienteId, rutinaId, diasEntrenamiento y diasDescanso son obligatorios",
    });
  }

  // Validar que req.user exista
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      mensaje: "No autorizado: Usuario no autenticado o ID no disponible",
    });
  }

  const cliente = await Cliente.findById(clienteId);
  if (!cliente) {
    return res.status(404).json({ mensaje: "Cliente no encontrado" });
  }

  const rutina = await Rutina.findById(rutinaId);
  if (!rutina) {
    return res.status(404).json({ mensaje: "Rutina no encontrada" });
  }

  const rutinaAsignada = new RutinaAsignada({
    clienteId,
    numeroIdentificacion: cliente.numeroIdentificacion,
    rutinaId,
    diasEntrenamiento: Array.isArray(diasEntrenamiento)
      ? diasEntrenamiento
      : [],
    diasDescanso: Array.isArray(diasDescanso) ? diasDescanso : [],
    asignadaPor: req.user._id,
  });

  const asignacionCreada = await rutinaAsignada.save();
  res
    .status(201)
    .json({
      mensaje: "Rutina asignada con éxito",
      rutinaAsignada: asignacionCreada,
    });
});

// @desc    Actualizar una asignación de rutina
// @route   PUT /api/rutinas/asignar/:id
// @access  Private (Admin, Entrenador)
exports.actualizarAsignacionRutina = asyncHandler(async (req, res) => {
  const { clienteId, rutinaId, diasEntrenamiento, diasDescanso } = req.body;

  // Validar campos requeridos
  if (!clienteId || !rutinaId || !diasEntrenamiento || !diasDescanso) {
    return res.status(400).json({
      mensaje:
        "Faltan campos requeridos: clienteId, rutinaId, diasEntrenamiento y diasDescanso son obligatorios",
    });
  }

  // Validar que req.user exista
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      mensaje: "No autorizado: Usuario no autenticado o ID no disponible",
    });
  }

  const rutinaAsignada = await RutinaAsignada.findByIdAndUpdate(
    req.params.id,
    {
      clienteId,
      rutinaId,
      diasEntrenamiento: Array.isArray(diasEntrenamiento)
        ? diasEntrenamiento
        : [],
      diasDescanso: Array.isArray(diasDescanso) ? diasDescanso : [],
      asignadaPor: req.user._id,
    },
    { new: true }
  );

  if (!rutinaAsignada) {
    return res.status(404).json({ mensaje: "Asignación no encontrada" });
  }

  res.json({ mensaje: "Asignación actualizada con éxito", rutinaAsignada });
});

// @desc    Eliminar una asignación de rutina
// @route   DELETE /api/rutinas/asignar/:id
// @access  Private (Admin)
exports.eliminarAsignacionRutina = asyncHandler(async (req, res) => {
  const rutinaAsignada = await RutinaAsignada.findByIdAndDelete(req.params.id);

  if (!rutinaAsignada) {
    return res.status(404).json({ mensaje: "Asignación no encontrada" });
  }

  res.json({ mensaje: "Asignación eliminada con éxito" });
});

// @desc    Consultar rutinas asignadas por número de identificación
// @route   GET /api/rutinas/consultar/:numeroIdentificacion
// @access  Private (Admin, Entrenador, Cliente)
exports.consultarRutinasPorNumeroIdentificacion = asyncHandler(
  async (req, res) => {
    console.log(
      "Número de identificación recibido:",
      req.params.numeroIdentificacion
    );
    const rutinasAsignadas = await RutinaAsignada.find({
      numeroIdentificacion: req.params.numeroIdentificacion,
    })
      .populate("clienteId", "nombre apellido numeroIdentificacion")
      .populate(
        "rutinaId",
        "grupoMuscular nombreEjercicio series repeticiones descripcion creadoPor"
      )
      .populate("asignadaPor", "nombre");

    console.log("Rutinas asignadas encontradas:", rutinasAsignadas);
    if (!rutinasAsignadas || rutinasAsignadas.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron rutinas asignadas para este cliente",
      });
    }

    const safeRutinasAsignadas = rutinasAsignadas.map((asignacion) => ({
      ...asignacion.toObject(),
      diasEntrenamiento: Array.isArray(asignacion.diasEntrenamiento)
        ? asignacion.diasEntrenamiento
        : [],
      diasDescanso: Array.isArray(asignacion.diasDescanso)
        ? asignacion.diasDescanso
        : [],
    }));

    console.log("Datos devueltos por el endpoint:", safeRutinasAsignadas);
    res.json(safeRutinasAsignadas);
  }
);
