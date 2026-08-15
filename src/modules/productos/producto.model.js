const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'El SKU es requerido'],
    unique: true,
    index: true, // Índice único
    trim: true,
    uppercase: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    minlength: [1, 'El nombre debe tener al menos 1 caracter'],
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio debe ser mayor o igual a 0']
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: 'El stock debe ser un número entero'
    },
    min: [0, 'El stock debe ser mayor o igual a 0']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    minlength: [1, 'La categoría debe tener al menos 1 caracter'],
    lowercase: true,
    trim: true,
    index: true // Índice secundario
  },
  descripcion: {
    type: String,
    default: null,
    trim: true
  },
  imagenUrl: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Es opcional
        return /^https?:\/\/.+/.test(v);
      },
      message: 'La imagenUrl debe ser una URL http(s) válida'
    }
  },
  proveedorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proveedor',
    required: [true, 'El proveedorId es requerido'],
    index: true // Índice secundario
  },
  disponible: {
    type: Boolean,
    default: function() {
      return this.stock > 0;
    }
  }
}, {
  timestamps: true // createdAt y updatedAt automáticos
});

// Middleware para asegurar que 'disponible' se mantenga actualizado con el stock
productoSchema.pre('save', function(next) {
  this.disponible = this.stock > 0;
  next();
});

const Producto = mongoose.model('Producto', productoSchema, 'productos');

module.exports = Producto;