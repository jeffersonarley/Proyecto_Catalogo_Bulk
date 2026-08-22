import mongoose from 'mongoose';

// Subesquema para registrar el detalle de las filas con error
const errorDetalleSchema = new mongoose.Schema({
  fila: {
    type: Number,
    required: true
  },
  sku: {
    type: String,
    default: null
  },
  motivo: {
    type: String,
    required: true
  }
}, { _id: false });

const importJobSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuarioId es requerido'],
    index: true
  },
  proveedorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proveedor',
    required: [true, 'El proveedorId es requerido'],
    index: true
  },
  archivoNombre: {
    type: String,
    required: [true, 'El nombre del archivo es requerido'],
    trim: true
  },
  archivoRuta: {
    type: String,
    required: [true, 'La ruta del archivo es requerida']
  },
  estado: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'completed', 'failed'],
      message: 'Estado de importación no válido'
    },
    default: 'pending',
    index: true
  },
  total: {
    type: Number,
    default: null,
    min: [0, 'El total de filas debe ser mayor o igual a 0']
  },
  procesados: {
    type: Number,
    default: 0,
    min: [0, 'Los procesados deben ser mayores o iguales a 0']
  },
  exitosos: {
    type: Number,
    default: 0,
    min: [0, 'Los exitosos deben ser mayores o iguales a 0']
  },
  fallidos: {
    type: Number,
    default: 0,
    min: [0, 'Los fallidos deben ser mayores o iguales a 0']
  },
  errores: {
    type: [errorDetalleSchema],
    default: [],
    validate: {
      validator: function(v) {
        // Opcional: puedes definir una constante IMPORT_ERRORS_CAP (ej: 100) en tu archivo de configuración
        const CAP_LIMIT = process.env.IMPORT_ERRORS_CAP ? parseInt(process.env.IMPORT_ERRORS_CAP) : 100;
        return v.length <= CAP_LIMIT;
      },
      message: 'Se ha excedido el límite máximo de errores permitidos (IMPORT_ERRORS_CAP)'
    }
  },
  bullJobId: {
    type: String,
    default: null
  },
  motivoFallo: {
    type: String,
    default: null,
    trim: true
  },
  startedAt: {
    type: Date,
    default: null
  },
  finishedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // createdAt y updatedAt automáticos
});

const ImportJob = mongoose.model('ImportJob', importJobSchema, 'import_jobs');

export default ImportJob;