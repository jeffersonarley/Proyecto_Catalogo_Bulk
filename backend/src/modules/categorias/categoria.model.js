import mongoose from 'mongoose';

const categoriaSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'El slug de la categoría es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    trim: true
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
        if (!v) return true; // Opcional
        return /^https?:\/\/.+/.test(v);
      },
      message: 'La imagenUrl debe ser una URL http(s) válida'
    }
  }
}, {
  timestamps: true // createdAt y updatedAt automáticos
});

const Categoria = mongoose.model('Categoria', categoriaSchema, 'categorias');

export default Categoria;