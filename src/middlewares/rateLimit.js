import AppError from '../errors/AppError.js';

const store = new Map();

export const rateLimit = ({ windowMs = 60_000, max = 60, keyGenerator = (req) => req.ip }) => {
  return (req, _res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      return next(new AppError('Demasiadas solicitudes, inténtalo de nuevo más tarde', 429, 'RATE_LIMIT_EXCEDIDO'));
    }

    return next();
  };
};

export const strictRateLimit = (req, _res, next) =>
  rateLimit({
    windowMs: 60_000,
    max: 5,
    keyGenerator: (r) => `${r.ip}:${r.body?.email || ''}`
  })(req, _res, next);

export default { rateLimit, strictRateLimit };
