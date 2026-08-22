import ImportJob from './importJob.model.js';
import Proveedor from '../proveedores/proveedor.model.js';

export const createImport = async ({ file, usuarioId = null, proveedorId = null }) => {
  if (!file) throw new Error('Se requiere un archivo para iniciar la importación.');
  if (!proveedorId) {
    const err = new Error('El proveedorId es obligatorio');
    err.statusCode = 400;
    throw err;
  }

  const proveedor = await Proveedor.findById(proveedorId);
  if (!proveedor) {
    const err = new Error('Proveedor no encontrado');
    err.statusCode = 404;
    throw err;
  }

  if (!proveedor.activo) {
    const err = new Error('Proveedor inactivo');
    err.statusCode = 409;
    throw err;
  }

  const jobPayload = {
    usuarioId,
    proveedorId,
    archivoNombre: file.originalname,
    archivoRuta: file.path || null,
    estado: 'pending',
    total: null,
    procesados: 0,
    exitosos: 0,
    fallidos: 0,
    errores: [],
    bullJobId: null,
    motivoFallo: null
  };

  const job = await ImportJob.create(jobPayload);
  return job;
};

export const getImport = async (id) => {
  if (!id) {
    throw new Error('El identificador de la importación es obligatorio.');
  }

  const job = await ImportJob.findById(id);
  if (!job) {
    throw new Error('No se encontró la importación solicitada.');
  }

  return job;
};

export const listImports = async (filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 }
  } = options;

  const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));

  const [items, total] = await Promise.all([
    ImportJob.find(filters).sort(sort).skip(skip).limit(Math.max(1, Number(limit))).lean(),
    ImportJob.countDocuments(filters)
  ]);

  return {
    items,
    total,
    page: Math.max(1, Number(page)),
    limit: Math.max(1, Number(limit)),
    pages: Math.ceil(total / Math.max(1, Number(limit))) || 1
  };
};

export const startImportProcessing = async (id) => {
  const job = await getImport(id);
  return ImportJob.findByIdAndUpdate(
    id,
    { status: 'processing', startedAt: new Date() },
    { new: true }
  );
};

export const finishImportProcessing = async (id, stats = {}) => {
  const job = await getImport(id);

  return ImportJob.findByIdAndUpdate(
    id,
    {
      status: 'completed',
      finishedAt: new Date(),
      totalRows: Number(stats.totalRows ?? job.totalRows ?? 0),
      processedRows: Number(stats.processedRows ?? job.processedRows ?? 0),
      insertedRows: Number(stats.insertedRows ?? job.insertedRows ?? 0),
      failedRows: Number(stats.failedRows ?? job.failedRows ?? 0),
      errorSummary: Array.isArray(stats.errorSummary) ? stats.errorSummary : []
    },
    { new: true }
  );
};

export const failImportProcessing = async (id, errorMessage, stats = {}) => {
  const job = await getImport(id);

  const errors = Array.isArray(errorMessage)
    ? errorMessage.filter(Boolean)
    : [errorMessage].filter(Boolean);

  return ImportJob.findByIdAndUpdate(
    id,
    {
      status: 'failed',
      finishedAt: new Date(),
      totalRows: Number(stats.totalRows ?? job.totalRows ?? 0),
      processedRows: Number(stats.processedRows ?? job.processedRows ?? 0),
      insertedRows: Number(stats.insertedRows ?? job.insertedRows ?? 0),
      failedRows: Number(stats.failedRows ?? job.failedRows ?? 0),
      errorSummary: [...job.errorSummary, ...errors]
    },
    { new: true }
  );
};

export const updateImport = async (id, payload = {}) => {
  const job = await getImport(id);
  Object.keys(payload).forEach((key) => {
    if (payload[key] !== undefined) {
      job[key] = payload[key];
    }
  });

  await job.save();
  return job;
};

export default {
  createImport,
  getImport,
  listImports,
  startImportProcessing,
  finishImportProcessing,
  failImportProcessing,
  updateImport
};
 