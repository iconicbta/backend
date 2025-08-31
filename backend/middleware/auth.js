const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Usuario = require("../models/Usuario"); // Línea 2: Causa el conflicto

// Middleware para verificar el token y autenticar al usuario
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token recibido:", token);

      if (!process.env.JWT_SECRET) {
        throw new Error("Clave secreta JWT no definida en .env");
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decodificado:", decoded);

      req.user = await Usuario.findById(decoded.id).select("-password");
      if (!req.user) {
        console.log("Usuario no encontrado para el ID:", decoded.id);
        return res
          .status(401)
          .json({ message: "No autorizado, usuario no encontrado" });
      }
      console.log("Usuario encontrado - Rol:", req.user.rol);

      next();
    } catch (error) {
      console.error("Error al verificar el token:", error.message);
      return res.status(401).json({
        message: "No autorizado, token inválido o expirado",
        error: error.message,
      });
    }
  } else {
    console.log("Encabezado Authorization no encontrado o mal formado");
    return res
      .status(401)
      .json({ message: "No autorizado, token no proporcionado" });
  }
});

module.exports = { protect };
