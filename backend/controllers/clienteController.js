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
      equipo, // 👈 agregado
    } = req.body;

    if (!equipo) {
      return res.status(400).json({ message: "El equipo es obligatorio" });
    }

    const clienteData = {
      nombre,
      apellido: apellido || "",
      email,
      telefono: telefono || "",
      direccion: direccion || "",
      estado: estado ? estado.toLowerCase() : "activo",
      numeroIdentificacion,
      fechaNacimiento: new Date(fechaNacimiento),
      edad: parseInt(edad),
      tipoDocumento,
      rh: rh || "",
      eps: eps || "",
      tallaTrenSuperior: tallaTrenSuperior || "",
      tallaTrenInferior: tallaTrenInferior || "",
      nombreResponsable: nombreResponsable || "",
      equipo, // 👈 guardamos el equipo
    };

    const nuevoCliente = new Cliente(clienteData);
    const clienteGuardado = await nuevoCliente.save();
    res.status(201).json(clienteGuardado);
  } catch (error) {
    res.status(500).json({ message: "Error al crear cliente: " + error.message });
  }
};
