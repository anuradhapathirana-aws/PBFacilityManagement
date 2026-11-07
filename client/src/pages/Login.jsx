import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema } from '@cleaningos/shared';
import { useAuth } from '../context/AuthContext.jsx';
import { useForm } from '../hooks/useForm.js';
import { Field, Notice } from '../components/ui/index.jsx';

export default function Login() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { values, onChange, errors, formError, validate, applyServerError } = useForm(loginSchema, { email: '', password: '' });
  const [busy, setBusy] = useState(false);

  if (admin) return <Navigate to={location.state?.from || '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const data = validate();
    if (!data) return;
    setBusy(true);
    try {
      await login(data);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      applyServerError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="panel auth-card" onSubmit={submit} noValidate>
        <div className="logo" style={{ margin: '0 0 16px' }}>
          ✦ CleaningOS
        </div>
        <h2>Admin sign in</h2>
        <Notice type="error">{formError}</Notice>
        <Field label="Email" required error={errors.email}>
          {(id, aria) => <input id={id} {...aria} name="email" type="email" autoComplete="username" maxLength={190} value={values.email} onChange={onChange} autoFocus />}
        </Field>
        <Field label="Password" required error={errors.password}>
          {(id, aria) => (
            <input id={id} {...aria} name="password" type="password" autoComplete="current-password" maxLength={128} value={values.password} onChange={onChange} />
          )}
        </Field>
        <button className="btn" type="submit" disabled={busy} style={{ width: '100%' }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
