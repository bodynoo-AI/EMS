import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerThunk, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, Briefcase, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', role: 'EMPLOYEE' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);

  useEffect(() => { dispatch(clearError()); }, []);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email required';
    if (form.password.length < 8) e.password = 'At least 8 characters';
    if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(form.password)) e.password = 'Include uppercase, lowercase & number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const { confirmPassword, ...data } = form;
    const result = await dispatch(registerThunk(data));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Account created! Please verify your email.');
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div style={{ position: 'relative', textAlign: 'center', color: '#fff', maxWidth: 440 }}>
          <div style={{ width: 70, height: 70, borderRadius: 20, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <Briefcase size={34} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 16px' }}>Join EMS Portal</h1>
          <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7 }}>
            Create your account to access the complete employee management suite with role-based access control.
          </p>
          <div style={{ marginTop: 40, textAlign: 'left' }}>
            {['Secure JWT Authentication', 'Role-Based Access Control', 'Real-time Notifications', 'Complete Audit Trail'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: '#94a3b8', fontSize: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 11 }}>✓</span>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Fill in the details to get started</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address <span>*</span></label>
              <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="you@company.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="HR">HR</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Password <span>*</span></label>
              <div style={{ position: 'relative' }}>
                <input className={`form-input ${errors.password ? 'error' : ''}`} type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 chars with uppercase & number"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingRight: 40 }} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password <span>*</span></label>
              <input className={`form-input ${errors.confirmPassword ? 'error' : ''}`} type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
