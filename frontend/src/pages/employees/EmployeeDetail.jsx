import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Edit2, Mail, Phone, MapPin, Calendar, Briefcase, Package, Clock, Star, ArrowLeft, Upload } from 'lucide-react';
import { employeeAPI } from '../../api/services';
import { Card, StatusBadge, Avatar, LoadingPage, PageHeader } from '../../components/common/UI';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    employeeAPI.getById(id)
      .then(r => setEmp(r.data.data))
      .catch(() => toast.error('Employee not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    try {
      await employeeAPI.uploadProfileImage(id, fd);
      toast.success('Profile image updated');
      const r = await employeeAPI.getById(id);
      setEmp(r.data.data);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingPage />;
  if (!emp) return <div>Employee not found</div>;

  const canEdit = ['ADMIN', 'HR'].includes(user?.role);
  const fullName = `${emp.firstName} ${emp.lastName}`;

  return (
    <div>
      <PageHeader
        title={fullName}
        subtitle={`${emp.employeeId} • ${emp.designation || 'Employee'}`}
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
            {canEdit && <Link to={`/employees/${id}/edit`} className="btn btn-primary"><Edit2 size={15} /> Edit</Link>}
          </>
        }
      />

      {/* Profile Hero */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Avatar src={emp.profileImage} name={fullName} size={90} />
            {canEdit && (
              <label style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Upload size={12} color="#fff" />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              </label>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <h2 style={{ margin: 0, fontSize: 22 }}>{fullName}</h2>
              <StatusBadge status={emp.user?.role} />
              <span className={`badge ${emp.isActive ? 'badge-green' : 'badge-red'}`}>{emp.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={13} />{emp.email}</span>
              {emp.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={13} />{emp.phone}</span>}
              {emp.department && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Briefcase size={13} />{emp.department.name}</span>}
              {emp.joiningDate && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} />Joined {format(new Date(emp.joiningDate), 'dd MMM yyyy')}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[['Leaves Applied', emp._count?.leaveApplications || 0, '#1e40af'], ['Assets Held', emp._count?.allocatedAssets || 0, '#0891b2']].map(([label, val, color]) => (
              <div key={label} style={{ textAlign: 'center', padding: '12px 20px', background: `${color}10`, borderRadius: 10 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'leaves', 'assets', 'skills'].map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-2">
          <Card title="Personal Information">
            <InfoRow label="Date of Birth" value={emp.dateOfBirth ? format(new Date(emp.dateOfBirth), 'dd MMM yyyy') : '—'} />
            <InfoRow label="Gender" value={emp.gender || '—'} />
            <InfoRow label="Phone" value={emp.phone || '—'} />
            <InfoRow label="Address" value={emp.address ? `${emp.address}, ${emp.city || ''}, ${emp.state || ''} ${emp.pincode || ''}` : '—'} />
            <InfoRow label="Country" value={emp.country || 'India'} />
          </Card>
          <Card title="Employment Details">
            <InfoRow label="Employee ID" value={emp.employeeId} mono />
            <InfoRow label="Designation" value={emp.designation || '—'} />
            <InfoRow label="Department" value={emp.department?.name || '—'} />
            <InfoRow label="Manager" value={emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : '—'} />
            <InfoRow label="Joining Date" value={emp.joiningDate ? format(new Date(emp.joiningDate), 'dd MMM yyyy') : '—'} />
            {canEdit && <InfoRow label="Salary" value={emp.salary ? `₹${Number(emp.salary).toLocaleString('en-IN')}` : '—'} />}
          </Card>
          {emp.manager && (
            <Card title="Reporting Manager">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={`${emp.manager.firstName} ${emp.manager.lastName}`} size={42} />
                <div>
                  <div style={{ fontWeight: 600 }}>{emp.manager.firstName} {emp.manager.lastName}</div>
                </div>
              </div>
            </Card>
          )}
          {emp.subordinates?.length > 0 && (
            <Card title={`Team Members (${emp.subordinates.length})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {emp.subordinates.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={`${s.firstName} ${s.lastName}`} size={32} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{s.firstName} {s.lastName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.designation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === 'leaves' && (
        <Card title="Leave History">
          <table>
            <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Applied On</th></tr></thead>
            <tbody>
              {emp.leaveApplications?.map(l => (
                <tr key={l.id}>
                  <td><StatusBadge status={l.leaveType} /></td>
                  <td style={{ fontSize: 13 }}>{format(new Date(l.startDate), 'dd MMM yyyy')}</td>
                  <td style={{ fontSize: 13 }}>{format(new Date(l.endDate), 'dd MMM yyyy')}</td>
                  <td>{l.totalDays}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(l.createdAt), 'dd MMM yyyy')}</td>
                </tr>
              ))}
              {(!emp.leaveApplications || emp.leaveApplications.length === 0) && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No leave history</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'assets' && (
        <Card title="Allocated Assets">
          {emp.allocatedAssets?.length === 0 ? (
            <div className="text-muted text-sm">No assets allocated</div>
          ) : (
            <div className="grid grid-3">
              {emp.allocatedAssets?.map(a => (
                <div key={a.id} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <Package size={18} color="var(--primary)" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.asset.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{a.asset.assetTag} • {a.asset.assetType}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'skills' && (
        <Card title="Skills & Expertise">
          {emp.skills?.length === 0 ? (
            <div className="text-muted text-sm">No skills listed</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {emp.skills?.map(s => (
                <div key={s.id} style={{ padding: '8px 14px', background: '#f0f4ff', borderRadius: 99, border: '1px solid #c7d7fd' }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>{s.skill.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>• {s.level}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

const InfoRow = ({ label, value, mono }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 500, fontFamily: mono ? 'monospace' : undefined, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
  </div>
);
