const mongoose = require("mongoose");

const composicionCorporalSchema = new mongoose.Schema(
  {
    identificacion: {
      type: String,
      required: true,
    },
    peso: {
      type: Number,
      required: true,
    },
    grasaCorporal: {
      type: Number,
      required: true,
    },
    masaMuscular: {
      type: Number,
      required: true,
    },
    aguaCorporal: {
      type: Number,
    },
    hueso: {
      type: Number,
    },
    metabolismoBasal: {
      type: Number,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ComposicionCorporal",
  composicionCorporalSchema
);
