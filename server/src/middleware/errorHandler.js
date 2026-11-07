import { Prisma } from '@prisma/client';
import { HttpError } from '../utils/httpError.js';
import { env } from '../config/env.js';

export const notFoundHandler = (req, _res, next) => next(new HttpError(404, `Route ${req.method} ${req.path} not found`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    err = new HttpError(400, 'Malformed JSON body');
  } else if (err?.type === 'entity.too.large') {
    err = new HttpError(413, 'Request body too large', { code: 'PAYLOAD_TOO_LARGE' });
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') err = new HttpError(404, 'Record not found');
    else if (err.code === 'P2002') err = new HttpError(409, 'A record with this value already exists');
    else if (err.code === 'P2003') err = new HttpError(409, 'This record is linked to other data');
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    err = new HttpError(503, 'Database unavailable. Is MySQL running?', { code: 'DB_UNAVAILABLE' });
  }

  if (!(err instanceof HttpError)) {
    console.error(err);
    err = new HttpError(500, env.NODE_ENV === 'production' ? 'Something went wrong' : err.message || 'Server error', {
      code: 'SERVER_ERROR',
    });
  }

  res.status(err.status).json({
    error: { message: err.message, code: err.code, ...(err.fields && { fields: err.fields }), ...(err.details && { details: err.details }) },
  });
};
