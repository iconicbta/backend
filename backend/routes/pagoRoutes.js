const express = require("express");
const router = express.Router();
const Pago = require("../models/Pago");
const Contabilidad = require("../models/Contabilidad");
const Cliente = require("../models/Cliente");
const Producto = require("../models/Producto");
const { protect, verificarPermisos } = require("../middleware/authMiddleware");

// Solo recepcionistas, admins y usuarios pueden acceder
router.get(
  "/:id",
  protect,
  verificarPermisos(["admin", "recepcionista"]),
  async (req, res) => {
    try {
      console.log("Solicitud GET recibida en /api/pagos/:id", req.params.id);
      const pago = await Pago.findById(req.params.id)
        .populate("cliente", "nombre apellido")
        .populate("producto", "nombre precio stock");

      if (!pago) {
        return res.status(404).json({
          mensaje: "Pago no encontrado",
          detalle: `No se encontró un pago con el ID ${req.params.id}`,
        });
      }

      console.log("Pago encontrado:", JSON.stringify(pago, null, 2));
      res.json(pago);
    } catch (error) {
      console.error("Error al obtener pago por ID:", error.stack);
      res.status(500).json({
        mensaje: "Error interno al obtener el pago",
        detalle: error.message || "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

router.put(
  "/:id",
  protect,
  verificarPermisos(["admin", "recepcionista"]),
  async (req, res) => {
    try {
      console.log(
        "Solicitud PUT recibida en /api/pagos/:id",
        req.params.id,
        req.body
      );
      const { cliente, producto, cantidad, monto, fecha, metodoPago } = req.body;

      if (!cantidad || !monto || !fecha || !metodoPago) {
        return res.status(400).json({
          mensaje: "Faltan campos requeridos",
          detalle: "Asegúrate de enviar cantidad, monto, fecha y metodoPago",
        });
      }

      const fechaPago = new Date(fecha);
      if (isNaN(fechaPago.getTime())) {
        return res.status(400).json({ mensaje: "Fecha inválida" });
      }

      const pagoExistente = await Pago.findById(req.params.id).populate(
        "producto",
        "stock"
      );

      if (producto && producto !== pagoExistente?.producto?.toString()) {
        const productoDoc = await Producto.findById(producto);
        if (productoDoc && productoDoc.stock < cantidad) {
          return res.status(400).json({
            mensaje: "Stock insuficiente",
            detalle: `Stock disponible: ${productoDoc.stock}, solicitado: ${cantidad}`,
          });
        }
      } else if (pagoExistente && cantidad > (pagoExistente.cantidad || 0)) {
        const diferencia = cantidad - (pagoExistente.cantidad || 0);
        const productoDoc = await Producto.findById(pagoExistente.producto);
        if (productoDoc && productoDoc.stock < diferencia) {
          return res.status(400).json({
            mensaje: "Stock insuficiente",
            detalle: `Stock disponible: ${productoDoc.stock}, diferencia requerida: ${diferencia}`,
          });
        }
      }

      const pagoActualizado = await Pago.findByIdAndUpdate(
        req.params.id,
        {
          cliente: cliente || undefined,
          producto: producto || undefined,
          cantidad: Number(cantidad),
          monto: Number(monto),
          fecha: fechaPago,
          metodoPago,
          estado: "Completado", // Asegurar estado al actualizar
        },
        { new: true, runValidators: true }
      )
        .populate("cliente", "nombre apellido")
        .populate("producto", "nombre precio stock");

      if (!pagoActualizado) {
        return res.status(404).json({
          mensaje: "Pago no encontrado",
          detalle: `No se encontró un pago con el ID ${req.params.id}`,
        });
      }

      if (pagoExistente) {
        const productoDoc = await Producto.findById(pagoActualizado.producto);
        if (productoDoc) {
          if (producto && producto !== pagoExistente.producto?.toString()) {
            if (pagoExistente.producto) {
              const productoAnterior = await Producto.findById(
                pagoExistente.producto
              );
              if (productoAnterior) {
                productoAnterior.stock += pagoExistente.cantidad || 0;
                await productoAnterior.save();
              }
            }
            productoDoc.stock -= cantidad;
            await productoDoc.save();
          } else if (cantidad !== (pagoExistente.cantidad || 0)) {
            const diferencia = cantidad - (pagoExistente.cantidad || 0);
            productoDoc.stock -= diferencia;
            await productoDoc.save();
          }
        }
      }

      console.log("Pago actualizado:", JSON.stringify(pagoActualizado, null, 2));
      res.json(pagoActualizado);
    } catch (error) {
      console.error("Error al actualizar pago:", error.stack);
      res.status(500).json({
        mensaje: "Error interno al actualizar el pago",
        detalle: error.message || "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

router.get(
  "/",
  protect,
  verificarPermisos(["admin", "recepcionista", "user"]),
  async (req, res) => {
    try {
      console.log("Solicitud GET recibida en /api/pagos", req.query);
      console.log("Modelo Pago:", Pago);

      if (!Pago || typeof Pago.find !== "function") {
        throw new Error("Modelo Pago no está correctamente definido");
      }

      const query = {};
      if (req.query.fechaInicio && req.query.fechaFin) {
        query.fecha = {
          $gte: new Date(req.query.fechaInicio),
          $lte: new Date(req.query.fechaFin),
        };
      }
      // Temporalmente sin filtro de estado para verificar todos los pagos
      // query.estado = "Completado";

      const pagos = await Pago.find(query)
        .populate("cliente", "nombre apellido")
        .populate("producto", "nombre precio")
        .populate("creadoPor", "nombre")
        .lean();

      console.log("Estados de los pagos:", pagos.map((p) => p.estado));
      console.log("Pagos encontrados:", JSON.stringify(pagos, null, 2));

      const total = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);
      console.log("Total calculado:", total);

      res.json({ pagos, total });
    } catch (error) {
      console.error("Error al listar pagos:", error.stack);
      res.status(500).json({
        mensaje: "Error interno al listar los pagos",
        detalle: error.message || "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

router.post(
  "/",
  protect,
  verificarPermisos(["admin", "recepcionista"]),
  async (req, res) => {
    try {
      console.log(
        "Solicitud POST recibida en /api/pagos",
        JSON.stringify(req.body, null, 2)
      );

      const { cliente, producto, cantidad, monto, fecha, metodoPago } = req.body;

      if (!cliente || !producto || !cantidad || !monto || !fecha || !metodoPago) {
        return res.status(400).json({
          mensaje: "Faltan campos requeridos",
          detalle:
            "Asegúrate de enviar cliente, producto, cantidad, monto, fecha y metodoPago",
        });
      }

      if (!req.user || !req.user._id) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado",
          detalle: "No se encontró el ID del usuario en el token",
        });
      }

      const fechaPago = new Date(fecha);
      if (isNaN(fechaPago.getTime())) {
        return res.status(400).json({ mensaje: "Fecha inválida" });
      }

      const productoDoc = await Producto.findById(producto);
      if (!productoDoc) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
      }
      if (productoDoc.stock < cantidad) {
        return res.status(400).json({
          mensaje: "Stock insuficiente",
          detalle: `Stock disponible: ${productoDoc.stock}, solicitado: ${cantidad}`,
        });
      }
      productoDoc.stock -= cantidad;
      await productoDoc.save();

      const nuevoPago = new Pago({
        cliente,
        producto,
        cantidad: Number(cantidad),
        monto: Number(monto),
        fecha: fechaPago,
        metodoPago,
        creadoPor: req.user._id,
        estado: "Completado", // Asegurar estado al crear
      });

      const pagoGuardado = await nuevoPago.save();

      const nuevaTransaccion = new Contabilidad({
        tipo: "ingreso",
        monto: Number(monto),
        fecha: fechaPago,
        descripcion: `Pago de cliente - Método: ${metodoPago}`,
        categoria: "Pago de cliente",
        cuentaDebito: "Caja",
        cuentaCredito: "Ingresos por servicios",
        referencia: `PAGO-${pagoGuardado._id}`,
        creadoPor: req.user._id,
      });

      await nuevaTransaccion.save();

      console.log("Pago creado:", JSON.stringify(pagoGuardado, null, 2));
      res.status(201).json({ mensaje: "Pago creado con éxito", pago: pagoGuardado });
    } catch (error) {
      console.error("Error al crear pago:", error.stack);
      res.status(500).json({
        mensaje: "Error interno al crear el pago",
        detalle: error.message || "Error desconocido",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

router.get(
  "/consultar/:numeroIdentificacion",
  protect,
  verificarPermisos(["admin", "recepcionista", "user"]),
  async (req, res) => {
    try {
      console.log(
        "Consultando pagos para numeroIdentificacion:",
        req.params.numeroIdentificacion
      );

      const cliente = await Cliente.findOne({
        numeroIdentificacion: req.params.numeroIdentificacion,
      });
      if (!cliente) {
        return res.status(404).json({
          mensaje: "Cliente no encontrado con este número de identificación.",
        });
      }

      const pagos = await Pago.find({ cliente: cliente._id })
        .populate("cliente", "nombre apellido")
        .populate("producto", "nombre")
        .lean();

      if (!pagos || pagos.length === 0) {
        return res
          .status(404)
          .json({ mensaje: "No se encontraron pagos para este cliente." });
      }

      const formattedPagos = pagos.map((pago) => ({
        monto: pago.monto,
        fechaPago: pago.fecha,
        metodoPago: pago.metodoPago,
        concepto: pago.producto?.nombre
          ? `Compra de producto: ${pago.producto.nombre}`
          : "Pago general",
      }));

      console.log("Pagos formateados:", formattedPagos);
      res.json(formattedPagos);
    } catch (error) {
      console.error("Error al consultar pagos:", error.message);
      res
        .status(500)
        .json({ mensaje: "Error interno del servidor.", error: error.message });
    }
  }
);

router.get(
  "/ingresos",
  protect,
  verificarPermisos(["admin", "recepcionista"]),
  async (req, res) => {
    try {
      console.log("Solicitud GET recibida en /api/pagos/ingresos", req.query);

      const query = { estado: "Completado" };
      if (req.query.fechaInicio && req.query.fechaFin) {
        query.fecha = {
          $gte: new Date(req.query.fechaInicio),
          $lte: new Date(req.query.fechaFin),
        };
      }

      const pagos = await Pago.find(query).lean();
      const totalIngresos = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);

      console.log("Ingresos calculados:", totalIngresos);
      res.json({ ingresos: totalIngresos, detalles: pagos });
    } catch (error) {
      console.error("Error al calcular ingresos:", error.message);
      res.status(500).json({ mensaje: "Error al calcular ingresos", error });
    }
  }
);

module.exports = router;
