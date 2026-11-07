import { useCallback, useRef, useState } from 'react';

const fieldErrors = (zodError) => {
  const out = {};
  for (const issue of zodError.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
};

/**
 * Form state + validation with a shared Zod schema.
 * - validate on submit; after the first submit, re-validate live on every change
 * - applyServerError() maps API 422 `fields` onto the same error slots
 * - extraCheck(values) returns additional { field: message } errors (UI-only rules)
 */
export function useForm(schema, initialValues, { extraCheck } = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const submitted = useRef(false);

  const run = useCallback(
    (v) => {
      const result = schema.safeParse(v);
      const errs = { ...(result.success ? {} : fieldErrors(result.error)), ...(extraCheck ? extraCheck(v) : {}) };
      return { errs, data: result.success ? result.data : null };
    },
    [schema, extraCheck]
  );

  const setField = useCallback(
    (name, value) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        if (submitted.current) setErrors(run(next).errs);
        return next;
      });
    },
    [run]
  );

  /** Generic onChange for <input>/<select>/<textarea name="..."> */
  const onChange = useCallback((e) => setField(e.target.name, e.target.value), [setField]);

  /** Returns parsed data or null (and sets errors). */
  const validate = useCallback(() => {
    submitted.current = true;
    const { errs, data } = run(values);
    setErrors(errs);
    setFormError(Object.keys(errs).length ? 'Please correct the highlighted fields.' : '');
    return Object.keys(errs).length ? null : data;
  }, [run, values]);

  const applyServerError = useCallback((err) => {
    setErrors(err.fields || {});
    setFormError(err.message || 'Request failed');
  }, []);

  const reset = useCallback((v) => {
    submitted.current = false;
    setValues(v);
    setErrors({});
    setFormError('');
  }, []);

  return { values, setValues, setField, onChange, errors, formError, setFormError, validate, applyServerError, reset };
}
