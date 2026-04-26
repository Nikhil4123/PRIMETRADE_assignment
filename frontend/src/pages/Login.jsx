import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

const mapApiErrors = (errors = []) => {
  return errors.reduce((acc, item) => {
    acc[item.field] = item.message;
    return acc;
  }, {});
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const isFormValid = form.email.trim() && form.password.trim();

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setAlert(null);

    try {
      const response = await loginApi(form);
      await login(response.data.token, response.data.user);
      setAlert({ type: 'success', message: response.message || 'Login successful' });
      navigate(from, { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed';
      const errors = error?.response?.data?.errors || [];
      setFieldErrors(mapApiErrors(errors));
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="muted">Sign in to continue to your dashboard.</p>

        {alert && (
          <div className={`alert ${alert.type}`} role="status" aria-live="polite">
            {alert.message}
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="jane@mail.com"
              required
            />
            {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
          </label>

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="******"
              required
            />
            {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
          </label>

          <button type="submit" className="btn btn-primary full" disabled={loading || !isFormValid}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {loading && <div className="spinner small" />}

        <p className="muted">
          New here? <Link to="/register">Create account</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
