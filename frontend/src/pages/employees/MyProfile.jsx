import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { employeeAPI, authAPI } from '../../api/services';
import { updateUser } from '../../store/slices/authSlice';
import { Card, PageHeader, FormGroup, Avatar, LoadingPage } from '../../components/common/UI';
import { User, Lock, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyProfile() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ phone: '', address: '', city: '', state: '', pincode: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    employeeAPI.getMyProfile()
      .then(r => {
        const e = r.data.data;
        setEmp(e);
        setForm({ phone: e.phone || '', address: e.address || '', city: e.city || '', state: e.state || '', pincode: e.pincode || '' });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await employeeAPI.updateMyProfile(form);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !emp) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
      await employeeAPI.uploadProfileImage(emp.id, fd);
      const r = await employeeAPI.getMyProfile();
      setEmp(r.data.data);
      toast.success('Profile photo updated');
    } catch {
      toast.error('Upload failed');
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal information and security settings" />

      {/* Header Card */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative' }}>
            <Avatar src={emp?.profileImage} name={emp ? `${emp.firstName} ${emp.lastName}` : user?.email} size={80} />
            <label style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Upload size={12} color="#fff" />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            </label>
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>
              {emp ? `${emp.firstName} ${emp.lastName}` : user?.email}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {emp?.designation || user?.role} • {emp?.department?.name || 'N/A'} • {user?.email}
            </div>
            {!user?.isEmailVerified && (
              <span style={{ fontSize: 11, background: '#fef9c3', color: '#b45309', padding: '2px 8px', borderRadius: 99, marginTop: 6, display: 'inline-block' }}>
                Email not verified
              </span>
            )}
          </div>
        </div>
      </Card>

      <div className="tabs">
        <button className={`tab${tab === 'profile' ? ' active' : ''}`} onClick={() => setTab('profile')}>
          <User size={14} style={{ marginRight: 5 }} />Profile
        </button>
        <button className={`tab${tab === 'security' ? ' active' : ''}`} onClick={() => setTab('security')}>
          <Lock size={14} style={{ marginRight: 5 }} />Security
        </button>
      </div>

      {tab === 'profile' && emp && (
        <form onSubmit={handleSaveProfile}>
          <Card title="Personal Details" style={{ marginBottom: 16 }}>
            <div className="grid grid-2">
              <FormGroup label="First Name"><input className="form-input" value={emp.firstName} disabled style={{ background: '#f8fafc' }} /></FormGroup>
              <FormGroup label="Last Name"><input className="form-input" value={emp.lastName} disabled style={{ background: '#f8fafc' }} /></FormGroup>
              <FormGroup label="Email"><input className="form-input" value={emp.email} disabled style={{ background: '#f8fafc' }} /></FormGroup>
              <FormGroup label="Employee ID"><input className="form-input" value={emp.employeeId} disabled style={{ background: '#f8fafc', fontFamily: 'monospace' }} /></FormGroup>
              <FormGroup label="Phone">
                <input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </FormGroup>
            </div>
          </Card>
          <Card title="Address">
            <div className="grid grid-2">
              <FormGroup label="Address">
                <textarea className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={{ minHeight: 70 }} />
              </FormGroup>
              <div>
                <FormGroup label="City"><input className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></FormGroup>
                <div className="grid grid-2">
                  <FormGroup label="State"><input className="form-input" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></FormGroup>
                  <FormGroup label="Pincode"><input className="form-input" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} /></FormGroup>
                </div>
              </div>
            </div>
          </Card>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={handleChangePassword}>
          <Card title="Change Password">
            <div style={{ maxWidth: 420 }}>
              <FormGroup label="Current Password">
                <input className="form-input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              </FormGroup>
              <FormGroup label="New Password" hint="Min 8 chars with uppercase & number">
                <input className="form-input" type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
              </FormGroup>
              <FormGroup label="Confirm New Password">
                <input className="form-input" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
              </FormGroup>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Update Password'}
              </button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
