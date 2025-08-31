const express = require("express");
const router = express.Router();
const {
  obtenerClientes,
  consultarClientePorCedula,
  crearCliente,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente,
  obtenerClientesActivos,
} = require("../controllers/clienteController");
const { protect } = require("../middleware/authMiddleware");

// Rutas públicas
router.get("/consultar/:numeroIdentificacion", consultarClientePorCedula);

// Rutas protegidas
router.use(protect);

router.get("/", obtenerClientes);
router.get("/activos", obtenerClientesActivos); // Ruta específica para clientes activos
router.get("/:id", obtenerClientePorId);
router.post("/", crearCliente);
router.put("/:id", actualizarCliente);
router.delete("/:id", eliminarCliente);

module.exports = router;
