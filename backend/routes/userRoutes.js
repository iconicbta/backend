const express = require("express");
const router = express.Router();
const { protect, verificarPermisos } = require("../middleware/authMiddleware"); // Cambiado a verificarPermisos
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Private (Admin)
router.get(
  "/",
  protect,
  verificarPermisos(["admin"]), // Cambiado de verificarRol a verificarPermisos
  asyncHandler(async (req, res) => {
    console.log(
      "Solicitud GET /api/usuarios recibida. Rol del usuario:",
      req.user.rol
    );

    const users = await Usuario.find().select("-password").lean();
    console.log("Usuarios encontrados:", users);

    if (!users || users.length === 0) {
      console.log("No se encontraron usuarios en la base de datos");
      return res.status(404).json({ mensaje: "No se encontraron usuarios" });
    }

    res.json(users);
  })
);

// @desc    Obtener un usuario por ID
// @route   GET /api/usuarios/:id
// @access  Private (Admin)
router.get(
  "/:id",
  protect,
  verificarPermisos(["admin"]), // Cambiado de verificarRol a verificarPermisos
  asyncHandler(async (req, res) => {
    console.log("Solicitud GET /api/usuarios/:id recibida. ID:", req.params.id);

    const user = await Usuario.findById(req.params.id)
      .select("-password")
      .lean();
    if (!user) {
      console.log("Usuario no encontrado con ID:", req.params.id);
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(user);
  })
);

// @desc    Actualizar un usuario
// @route   PUT /api/usuarios/:id
// @access  Private (Admin)
router.put(
  "/:id",
  protect,
  verificarPermisos(["admin"]), // Cambiado de verificarRol a verificarPermisos
  asyncHandler(async (req, res) => {
    console.log(
      "Solicitud PUT /api/usuarios/:id recibida. ID:",
      req.params.id,
      "Datos:",
      req.body
    );

    const user = await Usuario.findById(req.params.id);
    if (!user) {
      console.log("Usuario no encontrado con ID:", req.params.id);
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const { nombre, email, rol, password } = req.body;
    if (nombre) user.nombre = nombre;
    if (email) user.email = email;
    if (rol) user.rol = rol;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    console.log("Usuario actualizado:", user);

    res.json({
      mensaje: "Usuario actualizado con éxito",
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  })
);

// @desc    Eliminar un usuario
// @route   DELETE /api/usuarios/:id
// @access  Private (Admin)
router.delete(
  "/:id",
  protect,
  verificarPermisos(["admin"]), // Cambiado de verificarRol a verificarPermisos
  asyncHandler(async (req, res) => {
    console.log(
      "Solicitud DELETE /api/usuarios/:id recibida. ID:",
      req.params.id
    );

    const user = await Usuario.findById(req.params.id);
    if (!user) {
      console.log("Usuario no encontrado con ID:", req.params.id);
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    await user.deleteOne();
    console.log("Usuario eliminado con ID:", req.params.id);

    res.json({ mensaje: "Usuario eliminado con éxito" });
  })
);

module.exports = router;
