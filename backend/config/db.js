const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("❌ No se encontró la variable MONGODB_URI en Render");
    }

    console.log("Intentando conectarme a MongoDB Atlas...");

    const conn = await mongoose.connect(mongoUri);

    console.log(`🟢 MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("🔴 Error al conectar a MongoDB:", error.message);
    throw error;
  }
};

module.exports = { connectDB };
