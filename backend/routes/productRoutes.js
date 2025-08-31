const express = require("express");
const router = express.Router();
const {
  listarProductos,
  obtenerProductoPorId,
  agregarProducto,
  editarProducto,
  eliminarProducto,
} = require("../controllers/productController");
const { protect, verificarRol } = require("../middleware/authMiddleware");

// Rutas de productos
router.get("/", protect, listarProductos);
router.get("/:id", protect, obtenerProductoPorId);
router.post("/", protect, agregarProducto);
router.put("/:id", protect, editarProducto);
router.delete("/:id", protect, eliminarProducto);

module.exports = router;
