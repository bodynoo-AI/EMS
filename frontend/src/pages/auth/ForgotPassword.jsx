import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/services';
import { Mail, Lock, CheckCircle, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthShell = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Briefcase size={26} color="#fff" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>EMS Portal</h2>
      </div>
      <div className="card"><div className="card-body">{children}</div></div>
    </div>
  </div>
);

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      {sent ? (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px' }}>Check Your Email</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>We sent a password reset link to <strong>{email}</strong></p>
          <Link to="/login" className="btn btn-primary btn-full mt-3">Back to Login</Link>
        </div>
      ) : (
        <>
          <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700 }}>Forgot Password?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 24px' }}>Enter your email to receive a reset link.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: 38 }} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Send Reset Link'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>← Back to Login</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}

export function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authAPI.resetPassword(token, form.password);
      setDone(true);
      toast.success('Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      {done ? (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
          <h3>Password Reset!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Redirecting to login...</p>
        </div>
      ) : (
        <>
          <h3 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700 }}>Set New Password</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 24px' }}>Choose a strong new password.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type="password" placeholder="Min 8 chars" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingLeft: 38 }} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Reset Password'}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}

export function VerifyEmail() {
  const [status, setStatus] = useState('loading');
  const { token } = useParams();

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthShell>
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        {status === 'loading' && <div className="loading-spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />}
        {status === 'success' && (
          <>
            <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
            <h3>Email Verified!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Your email has been verified successfully.</p>
            <Link to="/login" className="btn btn-primary btn-full mt-3">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h3>Verification Failed</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>The link is invalid or has expired.</p>
            <Link to="/login" className="btn btn-secondary btn-full mt-3">Back to Login</Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export default ForgotPassword;
