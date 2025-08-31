const Cliente = require("../models/Cliente");
const Membresia = require("../models/Membresia");

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find().select(
      "nombre apellido email telefono direccion estado numeroIdentificacion fechaRegistro"
    );
    console.log("Clientes obtenidos:", clientes);
    res.status(200).json(clientes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener clientes: " + error.message });
  }
};

// Consultar cliente por número de identificación (pública)
const consultarClientePorCedula = async (req, res) => {
  try {
    const { numeroIdentificacion } = req.params;
    const cliente = await Cliente.findOne({ numeroIdentificacion });
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.status(200).json(cliente);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al consultar cliente: " + error.message });
  }
};

// Crear un nuevo cliente
const crearCliente = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      estado,
      numeroIdentificacion,
    } = req.body;
    console.log("Datos recibidos para crear cliente:", req.body);

    if (!nombre || !email || !numeroIdentificacion) {
      return res.status(400).json({
        message: "Nombre, email y número de identificación son obligatorios",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Correo electrónico inválido" });
    }

    if (telefono && !/^\d{10}$/.test(telefono)) {
      return res
        .status(400)
        .json({ message: "Teléfono debe tener 10 dígitos" });
    }

    if (estado && !["activo", "inactivo"].includes(estado.toLowerCase())) {
      return res
        .status(400)
        .json({ message: "Estado debe ser 'activo' o 'inactivo'" });
    }

    const clienteExistente = await Cliente.findOne({ numeroIdentificacion });
    if (clienteExistente) {
      return res
        .status(400)
        .json({ message: "El número de identificación ya está registrado" });
    }

    const nuevoCliente = new Cliente({
      nombre,
      apellido: apellido || "",
      email,
      telefono: telefono || "",
      direccion: direccion || "",
      estado: estado ? estado.toLowerCase() : "activo",
      numeroIdentificacion,
      fechaRegistro: new Date(),
    });

    const clienteGuardado = await nuevoCliente.save();
    res.status(201).json(clienteGuardado);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res
      .status(500)
      .json({ message: "Error al crear cliente: " + error.message });
  }
};

// Obtener un cliente por ID
const obtenerClientePorId = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.status(200).json(cliente);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener cliente: " + error.message });
  }
};

// Actualizar un cliente
const actualizarCliente = async (req, res) => {
  try {
    console.log("Datos recibidos para actualizar cliente:", req.body);
    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      estado,
      numeroIdentificacion,
    } = req.body;
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    if (!nombre || !email || !numeroIdentificacion) {
      return res.status(400).json({
        message: "Nombre, email y número de identificación son obligatorios",
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Correo electrónico inválido" });
    }

    if (telefono && !/^\d{10}$/.test(telefono)) {
      return res
        .status(400)
        .json({ message: "Teléfono debe tener 10 dígitos" });
    }

    if (estado && !["activo", "inactivo"].includes(estado.toLowerCase())) {
      return res
        .status(400)
        .json({ message: "Estado debe ser 'activo' o 'inactivo'" });
    }

    if (
      numeroIdentificacion &&
      numeroIdentificacion !== cliente.numeroIdentificacion
    ) {
      const clienteExistente = await Cliente.findOne({ numeroIdentificacion });
      if (clienteExistente) {
        return res
          .status(400)
          .json({ message: "El número de identificación ya está registrado" });
      }
    }

    cliente.nombre = nombre || cliente.nombre;
    cliente.apellido = apellido || "";
    cliente.email = email || cliente.email;
    cliente.telefono = telefono || "";
    cliente.direccion = direccion || "";
    cliente.estado = estado ? estado.toLowerCase() : cliente.estado;
    cliente.numeroIdentificacion =
      numeroIdentificacion || cliente.numeroIdentificacion;

    const clienteActualizado = await cliente.save();
    console.log("Cliente actualizado:", clienteActualizado);
    res.status(200).json(clienteActualizado);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar cliente: " + error.message });
  }
};

// Eliminar un cliente
const eliminarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.status(200).json({ message: "Cliente eliminado" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar cliente: " + error.message });
  }
};

// Obtener el número de clientes activos (basado en membresías activas)
const obtenerClientesActivos = async (req, res) => {
  try {
    console.log("Iniciando obtenerClientesActivos...");
    const fechaActual = new Date();
    console.log("Fecha actual:", fechaActual);

    // Buscar membresías activas
    const membresiasActivas = await Membresia.find({
      estado: "activa",
      fechafin: { $gt: fechaActual },
    }).distinct("cliente");

    console.log("Membresías activas encontradas:", membresiasActivas);

    // Contar clientes únicos con membresías activas
    const clientesActivos = membresiasActivas.length;
    console.log("Clientes activos encontrados:", clientesActivos);

    // Enviar respuesta
    res.status(200).json({ clientesActivos });
  } catch (error) {
    console.error("Error al obtener clientes activos:", error.message);
    res.status(500).json({
      message: "Error al obtener clientes activos: " + error.message,
    });
  }
};

module.exports = {
  obtenerClientes,
  consultarClientePorCedula,
  crearCliente,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente,
  obtenerClientesActivos,
};
