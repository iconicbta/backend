const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const Usuario = require("../models/userModel");
const { protect, verificarPermisos } = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");

/**
 * ==========================================================
 *  🔹 RUTA TEMPORAL: CREAR USUARIO (sin protección)
 *  - Úsela solo para registrar el primer admin
 *  - Después de crear el usuario, BORRE o COMENTE esta ruta
 * ==========================================================
 */
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    // Verificar si ya existe el correo
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El usuario ya existe" });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      rol: rol || "usuario", // Por defecto "usuario"
    });

    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    });
  })
);

/**
 * ==========================================================
 *  🔹 RUTAS PROTEGIDAS (solo admin)
 * ==========================================================
 */

// @desc    Obtener todos los usuarios
// @route   GET /api/usuarios
// @access  Privado (solo admin)
router.get(
  "/",
  protect,
  verificarPermisos(["admin"]),
  asyncHandler(async (req, res) => {
    const usuarios = await Usuario.find({});
    res.json(usuarios);
  })
);

// @desc    Actualizar usuario
// @route   PUT /api/usuarios/:id
// @access  Privado (solo admin)
router.put(
  "/:id",
  protect,
  verificarPermisos(["admin"]),
  asyncHandler(async (req, res) => {
    const usuario = await Usuario.findById(req.params.id);

    if (usuario) {
      usuario.nombre = req.body.nombre || usuario.nombre;
      usuario.email = req.body.email || usuario.email;
      usuario.rol = req.body.rol || usuario.rol;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(req.body.password, salt);
      }

      const actualizado = await usuario.save();
      res.json({
        mensaje: "Usuario actualizado",
        usuario: {
          id: actualizado._id,
          nombre: actualizado.nombre,
          email: actualizado.email,
          rol: actualizado.rol,
        },
      });
    } else {
      res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
  })
);

// @desc    Eliminar usuario
// @route   DELETE /api/usuarios/:id
// @access  Privado (solo admin)
router.delete(
  "/:id",
  protect,
  verificarPermisos(["admin"]),
  asyncHandler(async (req, res) => {
    const usuario = await Usuario.findById(req.params.id);

    if (usuario) {
      await usuario.deleteOne();
      res.json({ mensaje: "Usuario eliminado" });
    } else {
      res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
  })
);

module.exports = router;
