const sgMail = require("@sendgrid/mail");

// Configura tu API Key de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "TU_API_KEY_AQUI"); // Reemplaza con tu API Key

const enviarNotificacion = async (to, subject, text) => {
  const msg = {
    to, // Correo del destinatario
    from: "alfredhf2000@gmail.com", // Reemplaza con tu correo verificado en SendGrid
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log(`Notificación enviada a ${to}`);
  } catch (error) {
    console.error(
      "Error al enviar notificación:",
      error.response?.body || error
    );
    throw new Error("Error al enviar notificación");
  }
};

module.exports = { enviarNotificacion };
