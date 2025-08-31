const Product = require("../models/Producto");

// Listar todos los productos
const listarProductos = async (req, res) => {
  try {
    console.log("Solicitud para listar productos recibida");
    const productos = await Product.find().select(
      "nombre descripcion precio stock estado updatedAt createdAt" // Eliminado fechaRegistro
    );
    console.log("Productos encontrados:", productos);
    if (!productos || productos.length === 0) {
      console.log("No se encontraron productos en la base de datos");
      return res.status(200).json([]);
    }
    res.json(productos);
  } catch (error) {
    console.error("Error al listar productos:", error.message);
    res
      .status(500)
      .json({ message: "Error al listar productos", error: error.message });
  }
};

// Obtener un producto por ID
const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id).select(
      "nombre descripcion precio stock estado updatedAt createdAt" // Eliminado fechaRegistro
    );
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener producto", error: error.message });
  }
};

// Agregar un nuevo producto
const agregarProducto = async (req, res) => {
  try {
    console.log("Solicitud para agregar producto recibida:", req.body);
    const { nombre, descripcion, precio, stock, estado } = req.body;

    const newProducto = new Product({
      nombre,
      descripcion: descripcion || "",
      precio,
      stock: stock || 0,
      estado: estado || "activo",
      updatedAt: Date.now(),
    });

    const savedProducto = await newProducto.save();
    console.log("Producto guardado en la base de datos:", savedProducto);
    res.status(201).json(savedProducto);
  } catch (error) {
    console.error("Error al agregar producto:", error.message);
    res
      .status(500)
      .json({ message: "Error al agregar producto", error: error.message });
  }
};

// Editar un producto existente
const editarProducto = async (req, res) => {
  try {
    console.log("Solicitud para editar producto recibida:", req.body);
    const { nombre, descripcion, precio, stock, estado } = req.body;
    const producto = await Product.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, precio, stock, estado, updatedAt: Date.now() },
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    console.log("Producto actualizado:", producto);
    res.json(producto);
  } catch (error) {
    console.error("Error al editar producto:", error.message);
    res
      .status(500)
      .json({ message: "Error al editar producto", error: error.message });
  }
};

// Eliminar un producto
const eliminarProducto = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Validar si el producto es "Mensualidad" o "Clase"
    if (producto.nombre === "Mensualidad" || producto.nombre === "Clase") {
      console.log(`Intento de eliminar producto base: ${producto.nombre}`);
      return res.status(403).json({
        message:
          "No se puede eliminar este producto porque es un producto base.",
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    console.log("Producto eliminado:", producto);
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error.message);
    res
      .status(500)
      .json({ message: "Error al eliminar producto", error: error.message });
  }
};

module.exports = {
  listarProductos,
  obtenerProductoPorId,
  agregarProducto,
  editarProducto,
  eliminarProducto,
};
