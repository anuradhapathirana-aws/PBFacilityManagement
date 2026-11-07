import { HttpError, zodFields } from '../utils/httpError.js';

/**
 * validate({ body, query, params }) — each a Zod schema.
 * Parsed (trimmed/coerced) values replace the originals; handlers read req.valid.*
 */
export const validate = (schemas) => (req, _res, next) => {
  req.valid = req.valid || {};
  for (const part of ['params', 'query', 'body']) {
    const schema = schemas[part];
    if (!schema) continue;
    const result = schema.safeParse(req[part] ?? {});
    if (!result.success) {
      return next(new HttpError(422, 'Please correct the highlighted fields', { fields: zodFields(result.error) }));
    }
    req.valid[part] = result.data;
  }
  next();
};
