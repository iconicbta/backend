// backend/routes/pagoRoutes.js
const express = require("express");
const router = express.Router();
const Pago = require("../models/Pago");
const Contabilidad = require("../models/Contabilidad");
const Cliente = require("../models/Cliente");
const Producto = require("../models/Producto");
const { protect, verificarPermisos } = require("../middleware/authMiddleware");

// 📌 NUEVO ENDPOINT: Reporte de pagos por equipos
router.get(
  "/reporte",
  protect,
  verificarPermisos(["admin", "recepcionista", "user"]),
  async (req, res) => {
    try {
      console.log("Solicitud GET recibida en /api/pagos/reporte", req.query);

      const { fechaInicio, fechaFin, especialidad } = req.query;
      const query = { estado: "Completado" };

      // 📅 Filtros por fecha
      if (fechaInicio && fechaFin) {
        query.fecha = {
          $gte: new Date(fechaInicio),
          $lte: new Date(fechaFin),
        };
      }

      let pagos = await Pago.find(query)
        .populate({
          path: "cliente",
          select: "nombre apellido especialidad",
        })
        .populate("producto", "nombre precio")
        .lean();

      // 🔹 Filtrar por equipo/especialidad si se pasa en query
      if (especialidad) {
        pagos = pagos.filter(
          (pago) => pago.cliente?.especialidad === especialidad
        );
      }

      res.json({ pagos });
    } catch (error) {
      console.error("Error en /api/pagos/reporte:", error.stack);
      res.status(500).json({
        mensaje: "Error al generar el reporte de pagos",
        detalle: error.message || "Error desconocido",
      });
    }
  }
);

/**
 * 📊 NUEVA RUTA: Resumen por método de pago
 *
 * Opciones de filtrado:
 * - Puede recibir fechaInicio & fechaFin (ISO strings) para un rango arbitrario.
 * - O puede recibir rango = 'dia'|'semana'|'mes' (se calcula con base en hoy).
 *
 * Responde:
 * {
 *   resumen: [{ metodoPago: "Efectivo", total: 300000 }, ...],
 *   totalGeneral: 650000
 * }
 */
router.get(
  "/resumen-metodo-pago",
  protect,
  verificarPermisos(["admin", "recepcionista", "user"]),
  async (req, res) => {
    try {
      console.log("Solicitud GET recibida en /api/pagos/resumen-metodo-pago", req.query);

      const { fechaInicio, fechaFin, rango } = req.query; // rango opcional: 'dia'|'semana'|'mes'
      const query = { estado: "Completado" };

      // Si vienen fechaInicio y fechaFin, usar esos (permite filtros desde frontend)
      if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
          return res.status(400).json({ mensaje: "Fechas inválidas" });
        }
        fin.setHours(23, 59, 59, 999);
        query.fecha = { $gte: inicio, $lte: fin };
      } else if (rango) {
        // Si viene 'rango', calcular fechas con base en hoy
        const hoy = new Date();
        let inicio;
        if (rango === "dia") {
          inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        } else if (rango === "semana") {
          // Primer día de la semana (lunes). Ajusta si prefieres domingo.
          const day = hoy.getDay(); // 0 (domingo) .. 6 (sábado)
          // Calcular lunes: restar (day === 0 ? 6 : day - 1)
          const diffToMonday = day === 0 ? 6 : day - 1;
          inicio = new Date(hoy);
          inicio.setDate(hoy.getDate() - diffToMonday);
          inicio.setHours(0, 0, 0, 0);
        } else if (rango === "mes") {
          inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        } else {
          return res.status(400).json({ mensaje: "Valor de 'rango' inválido" });
        }
        const fin = new Date(); // hasta ahora
        fin.setHours(23, 59, 59, 999);
        query.fecha = { $gte: inicio, $lte: fin };
      }

      // Buscar pagos ya filtrados por fecha (si aplica)
      const pagos = await Pago.find(query).lean();

      // Inicializar totales esperados (asegura orden / métodos comunes)
      const resumenMap = {
        Efectivo: 0,
        Transferencia: 0,
        Tarjeta: 0,
      };

      // Sumar montos según metodoPago (si hay otros métodos, se agrupan también)
      pagos.forEach((p) => {
        const metodo = p.metodoPago || "Sin especificar";
        const monto = Number(p.monto || 0);
        if (resumenMap.hasOwnProperty(metodo)) {
          resumenMap[metodo] += monto;
        } else {
          // crear clave dinámica para métodos no esperados
          resumenMap[metodo] = (resumenMap[metodo] || 0) + monto;
        }
      });

      // Formatear respuesta como array y total general
      const resumen = Object.keys(resumenMap).map((metodo) => ({
        metodoPago: metodo,
        total: resumenMap[metodo],
      }));

      const totalGeneral = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);

      res.json({ resumen, totalGeneral });
    } catch (error) {
      console.error("Error en /api/pagos/resumen-metodo-pago:", error.stack);
      res.status(500).json({
        mensaje: "Error al generar el resumen por método de pago",
        detalle: error.message || "Error desconocido",
      });
    }
  }
);

// Obtener pago por ID
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

// Actualizar pago
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
          estado: "Completado",
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

// Listar pagos
router.get(
  "/",
  protect,
  verificarPermisos(["admin", "recepcionista", "user"]),
  async (req, res) => {
    try {
      console.log("Solicitud GET recibida en /api/pagos", req.query);

      if (!Pago || typeof Pago.find !== "function") {
        throw new Error("Modelo Pago no está correctamente definido");
      }

      const query = { estado: "Completado" };
      if (req.query.fechaInicio && req.query.fechaFin) {
        query.fecha = {
          $gte: new Date(req.query.fechaInicio),
          $lte: new Date(req.query.fechaFin),
        };
      }

      const pagos = await Pago.find(query)
        .populate("cliente", "nombre apellido")
        .populate("producto", "nombre precio")
        .populate("creadoPor", "nombre")
        .lean();

      console.log("Pagos encontrados:", JSON.stringify(pagos, null, 2));

      const total = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);
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

// Crear pago
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
        estado: "Completado",
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

// Consultar pagos por número de identificación
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

// Ingresos totales
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
