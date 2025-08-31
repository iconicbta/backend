const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: {
      // Cambiado de role a rol
      type: String,
      enum: ["user", "admin", "entrenador"],
      default: "user",
    },
  },
  { timestamps: true, collection: "usuarios" }
);

userSchema.methods.compararPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
