const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Prioriza la variable de entorno (útil en Render / Vercel)
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb+srv://gerencia:otF0Z8wGvnJdgm2T@cluster0.lvhzkqg.mongodb.net/porras?retryWrites=true&w=majority&appName=Cluster0";

    console.log("Intentando conectarme a MongoDB Atlas:", mongoUri);

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🟢 MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("🔴 Error al conectar a MongoDB:", error.message);
    throw error;
  }
};

module.exports = { connectDB };
