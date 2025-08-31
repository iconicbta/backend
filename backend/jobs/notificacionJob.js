const cron = require("node-cron");
const Membresia = require("../models/Membresia");
const Cliente = require("../models/Cliente");
const { enviarNotificacion } = require("../utils/emailService");

// Programa la tarea para ejecutarse todos los días a las 8:00 AM
const iniciarNotificaciones = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("Ejecutando verificación de vencimientos...");

    try {
      const fechaActual = new Date();
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaActual.getDate() + 3); // 3 días antes del vencimiento

      const membresiasProximasAVencer = await Membresia.find({
        fechaFin: { $gte: fechaActual, $lte: fechaLimite },
        estado: "activa",
      }).populate("cliente");

      for (const membresia of membresiasProximasAVencer) {
        const cliente = await Cliente.findById(membresia.cliente);
        if (cliente && cliente.email) {
          const diasRestantes = Math.ceil(
            (membresia.fechaFin - fechaActual) / (1000 * 60 * 60 * 24)
          );
          await enviarNotificacion(
            cliente.email,
            "Recordatorio: Tu membresía está a punto de vencer",
            `Hola ${
              cliente.nombre
            }, tu membresía vence en ${diasRestantes} días (${membresia.fechaFin.toLocaleDateString()}). Renueva ahora para seguir disfrutando de nuestros servicios.`
          );
        }
      }
    } catch (error) {
      console.error("Error en el job de notificaciones:", error);
    }
  });
};

module.exports = { iniciarNotificaciones };
