import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    trim: true,
    default: null
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un formato de email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    select: false // Evita que la contraseña se devuelva por defecto en las consultas
  },
  rol: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Crea automáticamente createdAt y updatedAt
});

// Opcional: Middleware para hashear la contraseña automáticamente antes de guardarla
usuarioSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

const Usuario = mongoose.model('Usuario', usuarioSchema, 'usuarios');

export default Usuario;