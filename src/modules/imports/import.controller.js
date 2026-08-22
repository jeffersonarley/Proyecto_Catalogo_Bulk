import { createImport, getImport, listImports } from './import.service.js';
import Proveedor from '../proveedores/proveedor.model.js';

export const createImportController = async (req, res, next) => {
  try {
    const file = req.file;
    const proveedorId = req.body.proveedorId;
    const usuarioId = req.usuario?.id ?? null;

    if (!file) return res.status(400).json({ success: false, message: 'Archivo faltante' });
    if (!proveedorId) return res.status(400).json({ success: false, message: 'proveedorId es obligatorio' });

    // createImport validates proveedor
    const job = await createImport({ file, usuarioId, proveedorId });

    return res.status(202).json({ importJobId: job._id, estado: job.estado });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};

export const getImportController = async (req, res, next) => {
  try {
    const job = await getImport(req.params.id);
    const porcentaje = job.total ? Math.round((job.procesados / job.total) * 100) : 0;

    return res.status(200).json({
      importJobId: job._id,
      proveedorId: job.proveedorId,
      estado: job.estado,
      total: job.total,
      procesados: job.procesados,
      exitosos: job.exitosos,
      fallidos: job.fallidos,
      porcentaje,
      errores: job.errores,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt
    });
  } catch (error) {
    return next(error);
  }
};

export const listImportsController = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const jobs = await listImports({}, { page, limit });

    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return next(error);
  }
};

export default {
  createImportController,
  getImportController,
  listImportsController
};
