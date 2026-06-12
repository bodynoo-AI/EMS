import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, clearError } from '../../store/slices/authSlice';
import { Eye, EyeOff, Mail, Lock, Briefcase, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);

  useEffect(() => { dispatch(clearError()); }, []);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginThunk(form));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@company.com', password: 'Admin@123' },
      hr: { email: 'hr@company.com', password: 'Hr@123456' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="auth-container">
      {/* Left Panel */}
      <div className="auth-left">
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%', opacity: 0.06,
              background: 'white',
              width: [300, 200, 150, 250, 180, 120][i],
              height: [300, 200, 150, 250, 180, 120][i],
              top: ['-10%', '20%', '60%', '40%', '75%', '10%'][i],
              left: ['-5%', '60%', '-8%', '50%', '70%', '40%'][i],
            }} />
          ))}
        </div>
        <div style={{ position: 'relative', textAlign: 'center', color: '#fff', maxWidth: 440 }}>
          <div style={{ width: 70, height: 70, borderRadius: 20, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <Briefcase size={34} />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>
            Employee Management System
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, margin: '0 0 40px' }}>
            A complete enterprise suite for managing your workforce — leaves, assets, departments, and analytics.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[['500+', 'Employees'], ['98%', 'Uptime'], ['50+', 'Features']].map(([val, lbl]) => (
              <div key={lbl} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 12px' }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{val}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">Sign in to EMS</h2>
          <p className="auth-subtitle">Enter your credentials to access the portal</p>

          {/* Demo buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('admin')} style={{ flex: 1 }}>
              Demo Admin
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => fillDemo('hr')} style={{ flex: 1 }}>
              Demo HR
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ paddingLeft: 38 }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? (
                <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              ) : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
