const Cliente = require("../models/Cliente");
const Membresia = require("../models/Membresia");

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener clientes: " + error.message });
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
      fechaNacimiento,
      edad,
      tipoDocumento,
      rh,
      eps,
      tallaTrenSuperior,
      tallaTrenInferior,
      nombreResponsable,
      equipo,
    } = req.body;

    if (
      !nombre ||
      !email ||
      !numeroIdentificacion ||
      !fechaNacimiento ||
      !edad ||
      !tipoDocumento
    ) {
      return res.status(400).json({
        message:
          "Nombre, email, número de identificación, fecha de nacimiento, edad y tipo de documento son obligatorios",
      });
    }

    const clienteExistente = await Cliente.findOne({ numeroIdentificacion });
    if (clienteExistente) {
      return res
        .status(400)
        .json({ message: "El número de identificación ya está registrado" });
    }

    const clienteData = {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      estado: estado ? estado.toLowerCase() : "activo",
      numeroIdentificacion,
      fechaNacimiento: new Date(fechaNacimiento),
      edad: parseInt(edad),
      tipoDocumento,
      rh,
      eps,
      tallaTrenSuperior,
      tallaTrenInferior,
      nombreResponsable,
      equipo, // 👈 guardar equipo
    };

    const nuevoCliente = new Cliente(clienteData);
    const clienteGuardado = await nuevoCliente.save();
    res.status(201).json(clienteGuardado);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear cliente: " + error.message });
  }
};

// Actualizar cliente
const actualizarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    Object.assign(cliente, req.body);

    const clienteActualizado = await cliente.save();
    res.status(200).json(clienteActualizado);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar cliente: " + error.message });
  }
};

module.exports = {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
};
