import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../api/auth.api';

const mapApiErrors = (errors = []) => {
  return errors.reduce((acc, item) => {
    acc[item.field] = item.message;
    return acc;
  }, {});
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const isFormValid = form.name.trim() && form.email.trim() && form.password.trim().length >= 6;

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setAlert(null);

    try {
      const response = await registerApi(form);
      setAlert({ type: 'success', message: response.message || 'Registration successful' });
      navigate('/login');
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed';
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
        <h1>Create Account</h1>
        <p className="muted">Start managing tasks with JWT-secured access.</p>

        {alert && (
          <div className={`alert ${alert.type}`} role="status" aria-live="polite">
            {alert.message}
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            <span>Name</span>
            <input name="name" value={form.name} onChange={onChange} placeholder="Jane Doe" required />
            {fieldErrors.name && <small className="field-error">{fieldErrors.name}</small>}
          </label>

          <label>
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={onChange} placeholder="jane@mail.com" required />
            {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
          </label>

          <label>
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={onChange} placeholder="******" required />
            {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
          </label>

          <button type="submit" className="btn btn-primary full" disabled={loading || !isFormValid}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        {loading && <div className="spinner small" />}

        <p className="muted">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
