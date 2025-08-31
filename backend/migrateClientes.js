const mongoose = require("mongoose");
const Cliente = require("./models/Cliente");

mongoose.connect("mongodb://localhost:27017/admin-gimnasios", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

Cliente.updateMany({ estado: "activo" }, { $set: { membresiaActiva: true } })
  .then(() => console.log("Clientes migrados con membresiaActiva: true"))
  .catch((err) => console.error(err))
  .finally(() => mongoose.connection.close());
