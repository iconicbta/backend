const asyncHandler = require("express-async-handler");
const Usuario = require("../models/Usuario");

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Private (Admin)
exports.obtenerUsuarios = asyncHandler(async (req, res) => {
  console.log(
    "Solicitud para obtener usuarios recibida. Rol del usuario:",
    req.user.rol
  );

  // Verificar que el usuario sea admin
  if (req.user.rol !== "admin") {
    console.log("Acceso denegado: usuario no es admin");
    return res
      .status(403)
      .json({ message: "No tienes permiso para ver los usuarios" });
  }

  const usuarios = await Usuario.find().select("-password").lean();

  console.log("Usuarios encontrados:", usuarios);

  if (!usuarios || usuarios.length === 0) {
    console.log("No se encontraron usuarios en la base de datos");
    return res.status(404).json({ message: "No se encontraron usuarios" });
  }

  res.json(usuarios);
});

// @desc    Obtener un usuario por ID
// @route   GET /api/usuarios/:id
// @access  Private (Admin)
exports.obtenerUsuarioPorId = asyncHandler(async (req, res) => {
  console.log("Solicitud para obtener usuario por ID:", req.params.id);

  const usuario = await Usuario.findById(req.params.id)
    .select("-password")
    .lean();

  if (!usuario) {
    console.log("Usuario no encontrado con ID:", req.params.id);
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  res.json(usuario);
});

// @desc    Actualizar un usuario
// @route   PUT /api/usuarios/:id
// @access  Private (Admin)
exports.actualizarUsuario = asyncHandler(async (req, res) => {
  console.log("Solicitud para actualizar usuario con ID:", req.params.id);
  console.log("Datos recibidos:", req.body);

  const { nombre, email, rol } = req.body;

  const usuario = await Usuario.findById(req.params.id);

  if (!usuario) {
    console.log("Usuario no encontrado con ID:", req.params.id);
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  // Verificar permisos
  if (req.user.rol !== "admin") {
    console.log("Acceso denegado: usuario no es admin");
    return res
      .status(403)
      .json({ message: "No tienes permiso para actualizar usuarios" });
  }

  usuario.nombre = nombre || usuario.nombre;
  usuario.email = email || usuario.email;
  usuario.rol = rol || usuario.rol;

  const usuarioActualizado = await usuario.save();
  console.log("Usuario actualizado:", usuarioActualizado);

  res.json({
    message: "Usuario actualizado con éxito",
    usuario: usuarioActualizado,
  });
});

// @desc    Eliminar un usuario
// @route   DELETE /api/usuarios/:id
// @access  Private (Admin)
exports.eliminarUsuario = asyncHandler(async (req, res) => {
  console.log("Solicitud para eliminar usuario con ID:", req.params.id);

  const usuario = await Usuario.findById(req.params.id);

  if (!usuario) {
    console.log("Usuario no encontrado con ID:", req.params.id);
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  // Verificar permisos
  if (req.user.rol !== "admin") {
    console.log("Acceso denegado: usuario no es admin");
    return res
      .status(403)
      .json({ message: "No tienes permiso para eliminar usuarios" });
  }

  await usuario.deleteOne();
  console.log("Usuario eliminado con ID:", req.params.id);

  res.json({ message: "Usuario eliminado con éxito" });
});
