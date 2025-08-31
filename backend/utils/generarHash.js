// backend/utils/generarHash.js

const bcrypt = require("bcryptjs");

const generarHash = async () => {
  const contraseña = "123"; // Puede reemplazarla por otra
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(contraseña, salt);
  console.log(`Contraseña original: ${contraseña}`);
  console.log(`Hash generado: ${hash}`);
};

generarHash();
