import React, { useEffect, useState } from 'react';
import { skillAPI } from '../api/services';
import { Card, PageHeader, Modal, FormGroup, ConfirmDialog, EmptyState } from '../components/common/UI';
import { Star, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps', 'Mobile', 'Design', 'Management', 'HR', 'Finance', 'Other'];

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Frontend' });
  const [filterCat, setFilterCat] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await skillAPI.getAll();
      setSkills(res.data.data);
    } catch { toast.error('Failed to load skills'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', category: 'Frontend' }); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, category: s.category }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await skillAPI.update(editing.id, form); toast.success('Skill updated'); }
      else { await skillAPI.create(form); toast.success('Skill created'); }
      setModal(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await skillAPI.delete(deleteId);
      toast.success('Skill deleted');
      setDeleteId(null);
      fetch();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  const grouped = skills.reduce((acc, s) => {
    const cat = filterCat ? (s.category === filterCat ? s.category : null) : s.category;
    if (!cat) return acc;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const CAT_COLORS = {
    Frontend: '#1e40af', Backend: '#7c3aed', Database: '#0891b2', Cloud: '#16a34a',
    DevOps: '#d97706', Mobile: '#dc2626', Design: '#ec4899', Management: '#64748b',
    HR: '#0f766e', Finance: '#854d0e', Other: '#475569',
  };

  return (
    <div>
      <PageHeader
        title="Skills Master"
        subtitle={`${skills.length} skills across ${Object.keys(grouped).length} categories`}
        actions={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Skill</button>}
      />

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <button className={`btn btn-sm ${!filterCat ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCat('')}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} className={`btn btn-sm ${filterCat === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCat(c)}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
      ) : Object.keys(grouped).length === 0 ? (
        <EmptyState icon={Star} title="No skills" message="Add your first skill"
          action={<button className="btn btn-primary" onClick={openCreate}>Add Skill</button>} />
      ) : (
        Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, catSkills]) => (
          <div key={cat} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLORS[cat] || '#64748b' }} />
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>{cat}</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{catSkills.length} skills</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {catSkills.map(skill => (
                <div key={skill.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  background: '#fff', border: '1px solid var(--border)', borderRadius: 99,
                  boxShadow: 'var(--shadow-sm)', transition: 'var(--transition)',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{skill.name}</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22, padding: 0 }} onClick={() => openEdit(skill)}>
                      <Edit2 size={11} />
                    </button>
                    <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22, padding: 0, color: 'var(--danger)' }} onClick={() => setDeleteId(skill.id)}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Skill' : 'Add Skill'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" form="skillForm" type="submit" disabled={saving}>
              {saving ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : editing ? 'Save' : 'Create'}
            </button>
          </>
        }>
        <form id="skillForm" onSubmit={handleSave}>
          <FormGroup label="Skill Name" required>
            <input className="form-input" placeholder="e.g. React.js" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </FormGroup>
          <FormGroup label="Category" required>
            <select className="form-input form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </FormGroup>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} danger
        title="Delete Skill" message="Delete this skill? It will be removed from all employee profiles." />
    </div>
  );
}
