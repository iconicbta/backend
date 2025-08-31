const Entrenador = require("../models/Entrenador");
const RegistroClases = require("../models/RegistroClases");
const Cliente = require("../models/Cliente");
const Clase = require("../models/Clase");

exports.obtenerClasesDisponibles = async (req, res) => {
  try {
    console.log("Solicitud GET /api/clases/disponibles recibida");
    const entrenadores = await Entrenador.find().lean();

    if (!entrenadores || entrenadores.length === 0) {
      console.log("No se encontraron entrenadores en la base de datos.");
      return res
        .status(404)
        .json({ message: "No se encontraron clases disponibles." });
    }

    const clasesDisponibles = entrenadores
      .flatMap((entrenador) => {
        if (!entrenador.clases || !Array.isArray(entrenador.clases)) {
          console.log(`Entrenador ${entrenador._id} no tiene clases definidas.`);
          return [];
        }
        return entrenador.clases
          .filter((clase) => !clase.estado || clase.estado === "activa")
          .map((clase) => {
            const primerDia = Array.isArray(clase.dias) && clase.dias.length > 0 ? clase.dias[0] : null;
            return {
              entrenadorId: entrenador._id.toString(),
              entrenadorNombre: entrenador.nombre,
              especialidad: entrenador.especialidad,
              nombreClase: clase.nombreClase,
              dia: primerDia?.dia || "No especificado",
              horarioInicio: primerDia?.horarioInicio || "No especificado",
              horarioFin: primerDia?.horarioFin || "No especificado",
              capacidadMaxima: clase.capacidadMaxima,
            };
          });
      })
      .filter((clase) => clase !== undefined);

    if (clasesDisponibles.length === 0) {
      console.log("No se encontraron clases activas en los entrenadores.");
      return res
        .status(404)
        .json({ message: "No se encontraron clases disponibles." });
    }

    console.log("Clases disponibles enviadas:", clasesDisponibles);
    res.json(clasesDisponibles);
  } catch (error) {
    console.error("Error al obtener clases disponibles:", error.stack);
    res.status(500).json({
      message: "Error interno del servidor al obtener clases.",
      error: error.message,
    });
  }
};

exports.registrarClienteEnClase = async (req, res) => {
  try {
    const {
      numeroIdentificacion,
      entrenadorId,
      nombreClase,
      dia,
      horarioInicio,
      horarioFin,
    } = req.body;

    console.log("🚀 [REGISTRO] Datos recibidos para registrar:", req.body);

    // Validación de campos
    if (
      !numeroIdentificacion ||
      !entrenadorId ||
      !nombreClase ||
      !dia ||
      !horarioInicio ||
      !horarioFin
    ) {
      console.log("❌ [REGISTRO] Faltan campos requeridos:", {
        numeroIdentificacion,
        entrenadorId,
        nombreClase,
        dia,
        horarioInicio,
        horarioFin,
      });
      return res.status(400).json({
        message: "Todos los campos son requeridos.",
      });
    }
    console.log("✅ [REGISTRO] Todos los campos están presentes.");

    // Buscar cliente
    console.log("🔍 [REGISTRO] Buscando cliente con numeroIdentificacion:", numeroIdentificacion);
    const cliente = await Cliente.findOne({ numeroIdentificacion });
    if (!cliente) {
      console.log("❌ [REGISTRO] Cliente no encontrado:", numeroIdentificacion);
      return res
        .status(404)
        .json({ message: "Número de identificación no encontrado." });
    }
    console.log("✅ [REGISTRO] Cliente encontrado:", cliente._id);

    // Buscar entrenador
    console.log("🔍 [REGISTRO] Buscando entrenador con entrenadorId:", entrenadorId);
    const entrenador = await Entrenador.findById(entrenadorId);
    if (!entrenador) {
      console.log("❌ [REGISTRO] Entrenador no encontrado:", entrenadorId);
      return res.status(404).json({ message: "Entrenador no encontrado." });
    }
    console.log("✅ [REGISTRO] Entrenador encontrado:", entrenador._id);

    // Verificar y buscar clase
    console.log("🔍 [REGISTRO] Verificando clases del entrenador:", entrenador.clases);
    if (!entrenador.clases || !Array.isArray(entrenador.clases)) {
      console.log("❌ [REGISTRO] El entrenador no tiene clases definidas:", entrenador._id);
      return res.status(404).json({ message: "El entrenador no tiene clases definidas." });
    }
    console.log("✅ [REGISTRO] Clases del entrenador verificadas.");

    const clase = entrenador.clases.find(
      (c) =>
        c.nombreClase === nombreClase &&
        c.dias.some(
          (d) =>
            d.dia === dia &&
            d.horarioInicio === horarioInicio &&
            d.horarioFin === horarioFin
        )
    );
    if (!clase) {
      console.log("❌ [REGISTRO] Clase no encontrada:", { nombreClase, dia, horarioInicio, horarioFin });
      return res
        .status(404)
        .json({ message: "Clase no encontrada en el entrenador." });
    }
    console.log("✅ [REGISTRO] Clase encontrada:", clase.nombreClase);

    // Buscar día específico
    const diaClase = clase.dias.find(
      (d) =>
        d.dia === dia &&
        d.horarioInicio === horarioInicio &&
        d.horarioFin === horarioFin
    );
    if (!diaClase) {
      console.log("❌ [REGISTRO] Día y horario no encontrados:", { dia, horarioInicio, horarioFin });
      return res
        .status(404)
        .json({ message: "Día y horario no encontrados para esta clase." });
    }
    console.log("✅ [REGISTRO] Día y horario encontrados.");

    // Verificar capacidad
    console.log("🔍 [REGISTRO] Contando registros existentes:", { entrenadorId, nombreClase, dia, horarioInicio, horarioFin });
    const registros = await RegistroClases.find({
      entrenadorId,
      nombreClase,
      dia,
      horarioInicio,
      horarioFin,
    });
    if (registros.length >= clase.capacidadMaxima) {
      console.log("❌ [REGISTRO] Capacidad máxima alcanzada:", clase.capacidadMaxima);
      return res
        .status(400)
        .json({ message: "Capacidad máxima de la clase alcanzada." });
    }
    console.log("✅ [REGISTRO] Capacidad disponible:", clase.capacidadMaxima - registros.length);

    // Crear y guardar registro
    console.log("💾 [REGISTRO] Creando nuevo registro:", {
      numeroIdentificacion,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      entrenadorId,
      nombreClase,
      dia,
      horarioInicio,
      horarioFin,
    });
    const registro = new RegistroClases({
      numeroIdentificacion,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      entrenadorId,
      nombreClase,
      dia,
      horarioInicio,
      horarioFin,
    });
    const nuevoRegistro = await registro.save();
    console.log("✅ [REGISTRO] Registro guardado:", nuevoRegistro._id);

    res.status(201).json({
      message: "Cliente registrado en clase con éxito",
      registro: nuevoRegistro,
    });
  } catch (error) {
    console.error("❌ [REGISTRO] Error al registrar cliente en clase:", error.stack);
    res.status(500).json({
      message: "Error interno del servidor al registrar cliente en clase",
      error: error.message,
    });
  }
};

exports.consultarClasesPorNumeroIdentificacion = async (req, res) => {
  const { numeroIdentificacion } = req.params;

  try {
    const registros = await RegistroClases.find({
      numeroIdentificacion,
    }).lean();
    if (!registros || registros.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron registros para este cliente." });
    }

    const clasesConDetalles = await Promise.all(
      registros.map(async (registro) => {
        const entrenador = await Entrenador.findById(
          registro.entrenadorId
        ).lean();
        return {
          nombreCompleto: `${registro.nombre} ${registro.apellido}`,
          entrenadorNombre: entrenador ? entrenador.nombre : "Desconocido",
          nombreClase: registro.nombreClase,
          dia: registro.dia,
          horarioInicio: registro.horarioInicio,
          horarioFin: registro.horarioFin,
        };
      })
    );
    res.json(clasesConDetalles);
  } catch (error) {
    console.error("Error al consultar clases:", error.message);
    res
      .status(500)
      .json({ message: "Error interno del servidor.", error: error.message });
  }
};

exports.obtenerInscritosPorClase = async (req, res) => {
  try {
    const { entrenadorId, nombreClase, dia, horarioInicio, horarioFin } =
      req.query;

    console.log("Parámetros recibidos en /inscritos:", {
      entrenadorId,
      nombreClase,
      dia,
      horarioInicio,
      horarioFin,
    });

    if (
      !entrenadorId ||
      !nombreClase ||
      !dia ||
      !horarioInicio ||
      !horarioFin
    ) {
      return res.status(400).json({
        message:
          "Todos los parámetros (entrenadorId, nombreClase, dia, horarioInicio, horarioFin) son requeridos.",
      });
    }

    const inscritos = await RegistroClases.find({
      entrenadorId,
      nombreClase: {
        $regex: new RegExp(nombreClase.trim().toLowerCase(), "i"),
      },
      dia: dia.toLowerCase().trim(),
      horarioInicio: horarioInicio.trim().padStart(5, "0"),
      horarioFin: horarioFin.trim().padStart(5, "0"),
    }).lean();

    console.log("Inscritos encontrados:", inscritos);

    if (!inscritos || inscritos.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay inscritos en esta clase." });
    }

    const nombresInscritos = inscritos.map((inscrito) => ({
      nombreCompleto: `${inscrito.nombre} ${inscrito.apellido}`,
    }));

    console.log("Nombres de inscritos devueltos:", nombresInscritos);
    res.json(nombresInscritos);
  } catch (error) {
    console.error("Error al obtener inscritos por clase:", error.message);
    res.status(500).json({
      message: "Error interno del servidor al obtener inscritos.",
      error: error.message,
    });
  }
};

exports.obtenerClases = async (req, res) => {
  try {
    console.log("Solicitud GET /api/clases recibida");
    const entrenadores = await Entrenador.find().lean();

    if (!entrenadores || entrenadores.length === 0) {
      console.log("No se encontraron entrenadores en la base de datos.");
      return res.status(404).json({ message: "No se encontraron clases." });
    }

    const todasLasClases = entrenadores.flatMap((entrenador) =>
      entrenador.clases
        ? entrenador.clases.map((clase) => ({
            ...clase,
            entrenadorId: entrenador._id.toString(),
            entrenadorNombre: entrenador.nombre,
            especialidad: entrenador.especialidad,
          }))
        : []
    );

    if (todasLasClases.length === 0) {
      console.log("No se encontraron clases en los entrenadores.");
      return res.status(404).json({ message: "No se encontraron clases." });
    }

    console.log("Clases enviadas:", todasLasClases);
    res.json(todasLasClases);
  } catch (error) {
    console.error("Error al obtener clases:", error.stack);
    res.status(500).json({
      message: "Error interno del servidor al obtener clases.",
      error: error.message,
    });
  }
};

// Nueva función para el ADMIN
exports.obtenerTodasInscripciones = async (req, res) => {
  try {
    console.log("Solicitud GET /api/clases/todas-inscripciones recibida");
    const inscripciones = await RegistroClases.find()
      .populate("numeroIdentificacion", "nombre apellido correoElectronico") // Asegúrate de que Cliente tenga estos campos
      .lean();

    if (!inscripciones || inscripciones.length === 0) {
      console.log("No se encontraron inscripciones.");
      return res.status(404).json({ message: "No hay inscripciones registradas." });
    }

    // Agrupar por clase
    const inscripcionesPorClase = inscripciones.reduce((acc, registro) => {
      const clave = `${registro.nombreClase}-${registro.dia}-${registro.horarioInicio}-${registro.horarioFin}`;
      if (!acc[clave]) {
        acc[clave] = {
          nombreClase: registro.nombreClase,
          dia: registro.dia,
          horarioInicio: registro.horarioInicio,
          horarioFin: registro.horarioFin,
          inscritos: [],
        };
      }
      acc[clave].inscritos.push({
        numeroIdentificacion: registro.numeroIdentificacion._id,
        nombreCompleto: `${registro.numeroIdentificacion.nombre} ${registro.numeroIdentificacion.apellido}`,
        correo: registro.numeroIdentificacion.correoElectronico,
      });
      return acc;
    }, {});

    console.log("Inscripciones por clase enviadas:", Object.values(inscripcionesPorClase));
    res.json(Object.values(inscripcionesPorClase));
  } catch (error) {
    console.error("Error al obtener todas las inscripciones:", error.stack);
    res.status(500).json({
      message: "Error interno del servidor al obtener inscripciones.",
      error: error.message,
    });
  }
};
