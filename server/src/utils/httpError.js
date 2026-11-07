export class HttpError extends Error {
  constructor(status, message, { code, fields, details } = {}) {
    super(message);
    this.status = status;
    this.code = code || defaultCode(status);
    this.fields = fields;
    this.details = details;
  }
}

const defaultCode = (s) =>
  ({ 400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 422: 'VALIDATION_ERROR' }[s] ||
  'ERROR');

export const notFound = (what = 'Resource') => new HttpError(404, `${what} not found`);

/** Convert Zod issues into { fieldName: firstMessage }. */
export const zodFields = (error) => {
  const fields = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
};

/** Wrap async route handlers so rejections reach the error middleware. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
