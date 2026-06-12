import React, { useEffect, useState } from 'react';
import { departmentAPI, employeeAPI } from '../api/services';
import { Card, PageHeader, Modal, FormGroup, ConfirmDialog, EmptyState, Avatar } from '../components/common/UI';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '', managerId: '' });

  const fetch = async () => {
    setLoading(true);
    try {
      const [dRes, eRes] = await Promise.all([departmentAPI.getAll(), employeeAPI.getAll({ limit: 100 })]);
      setDepartments(dRes.data.data);
      setEmployees(eRes.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', description: '', managerId: '' }); setModal(true); };
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, code: d.code, description: d.description || '', managerId: d.managerId || '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await departmentAPI.update(editing.id, form); toast.success('Department updated'); }
      else { await departmentAPI.create(form); toast.success('Department created'); }
      setModal(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await departmentAPI.delete(deleteId);
      toast.success('Department deleted');
      setDeleteId(null);
      fetch();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle={`${departments.length} departments`}
        actions={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Department</button>}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
      ) : departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments" message="Create your first department"
          action={<button className="btn btn-primary" onClick={openCreate}>Add Department</button>} />
      ) : (
        <div className="grid grid-3">
          {departments.map(dept => (
            <div key={dept.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #1e40af, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} color="#fff" />
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(dept)}><Edit2 size={14} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(dept.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>{dept.name}</h3>
                <code style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, color: 'var(--text-secondary)' }}>{dept.code}</code>
                {dept.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, marginBottom: 12 }}>{dept.description}</p>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                      {dept._count?.employees || 0}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>employees</span>
                  </div>
                  {dept.manager && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Avatar name={`${dept.manager.firstName} ${dept.manager.lastName}`} size={22} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dept.manager.firstName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Department' : 'Add Department'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="deptForm" type="submit" disabled={saving}>
              {saving ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : editing ? 'Save Changes' : 'Create'}
            </button>
          </>
        }>
        <form id="deptForm" onSubmit={handleSave}>
          <FormGroup label="Department Name" required>
            <input className="form-input" placeholder="Engineering" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </FormGroup>
          <FormGroup label="Code" required hint="Short unique identifier e.g. ENG, HR, FIN">
            <input className="form-input" placeholder="ENG" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required maxLength={10} />
          </FormGroup>
          <FormGroup label="Description">
            <textarea className="form-input" placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </FormGroup>
          <FormGroup label="Department Head">
            <select className="form-input form-select" value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}>
              <option value="">Select manager...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
            </select>
          </FormGroup>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} danger
        title="Delete Department" message="Are you sure you want to delete this department? Employees in this department will be unassigned." />
    </div>
  );
}
