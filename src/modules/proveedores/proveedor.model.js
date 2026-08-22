import mongoose from 'mongoose';

const proveedorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del proveedor es requerido'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'El slug es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    // Expresión regular para asegurar que solo tenga letras, números y guiones
    match: [/^[a-z0-9-]+$/, 'El slug solo puede contener minúsculas, números y guiones'],
    index: true
  },
  contactoEmail: {
    type: String,
    default: null,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'El formato del email no es válido']
  },
  logoUrl: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Opcional
        return /^https?:\/\/.+/.test(v);
      },
      message: 'La URL del logo debe ser http(s) válida'
    }
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // createdAt y updatedAt automáticos
});

const Proveedor = mongoose.model('Proveedor', proveedorSchema, 'proveedores');

export default Proveedor;