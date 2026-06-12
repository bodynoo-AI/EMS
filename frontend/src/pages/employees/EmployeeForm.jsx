import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeAPI, departmentAPI, skillAPI } from '../../api/services';
import { Card, PageHeader, FormGroup } from '../../components/common/UI';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [tab, setTab] = useState('basic');

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
    address: '', city: '', state: '', country: 'India', pincode: '',
    departmentId: '', designation: '', joiningDate: '', salary: '', managerId: '',
    userId: '',
  });

  useEffect(() => {
    Promise.all([
      departmentAPI.getAll(),
      skillAPI.getAll(),
      fetch('/api/employees?limit=100').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([d, s]) => {
      setDepartments(d.data.data);
      setSkills(s.data.data);
    });

    if (isEdit) {
      employeeAPI.getById(id).then(r => {
        const emp = r.data.data;
        setForm({
          firstName: emp.firstName || '', lastName: emp.lastName || '',
          email: emp.email || '', phone: emp.phone || '',
          dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
          gender: emp.gender || '', address: emp.address || '', city: emp.city || '',
          state: emp.state || '', country: emp.country || 'India', pincode: emp.pincode || '',
          departmentId: emp.departmentId || '', designation: emp.designation || '',
          joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
          salary: emp.salary || '', managerId: emp.managerId || '', userId: emp.userId || '',
        });
        setSelectedSkills(emp.skills?.map(s => ({ skillId: s.skillId, level: s.level, yearsExp: s.yearsExp || 0 })) || []);
      });
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSkillToggle = (skillId) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.skillId === skillId);
      if (exists) return prev.filter(s => s.skillId !== skillId);
      return [...prev, { skillId, level: 'Intermediate', yearsExp: 1 }];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, skills: selectedSkills };
      if (isEdit) {
        await employeeAPI.update(id, payload);
        toast.success('Employee updated');
      } else {
        await employeeAPI.create(payload);
        toast.success('Employee created');
      }
      navigate('/employees');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const TABS = ['basic', 'employment', 'skills', 'emergency'];

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Employee' : 'Add New Employee'}
        subtitle={isEdit ? 'Update employee information' : 'Fill in the details to create a new employee profile'}
        actions={<button className="btn btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>}
      />

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} Info
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {tab === 'basic' && (
          <Card title="Basic Information">
            <div className="grid grid-2">
              <FormGroup label="First Name" required>
                <input className="form-input" placeholder="John" value={form.firstName} onChange={e => set('firstName', e.target.value)} required />
              </FormGroup>
              <FormGroup label="Last Name" required>
                <input className="form-input" placeholder="Doe" value={form.lastName} onChange={e => set('lastName', e.target.value)} required />
              </FormGroup>
              <FormGroup label="Email Address" required>
                <input className="form-input" type="email" placeholder="john@company.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </FormGroup>
              <FormGroup label="Phone">
                <input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </FormGroup>
              <FormGroup label="Date of Birth">
                <input className="form-input" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
              </FormGroup>
              <FormGroup label="Gender">
                <select className="form-input form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
              </FormGroup>
            </div>
            <div className="grid grid-2" style={{ marginTop: 4 }}>
              <FormGroup label="Address">
                <textarea className="form-input" placeholder="Street address" value={form.address} onChange={e => set('address', e.target.value)} style={{ minHeight: 70 }} />
              </FormGroup>
              <div>
                <FormGroup label="City">
                  <input className="form-input" placeholder="Mumbai" value={form.city} onChange={e => set('city', e.target.value)} />
                </FormGroup>
                <div className="grid grid-2">
                  <FormGroup label="State">
                    <input className="form-input" placeholder="Maharashtra" value={form.state} onChange={e => set('state', e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Pincode">
                    <input className="form-input" placeholder="400001" value={form.pincode} onChange={e => set('pincode', e.target.value)} />
                  </FormGroup>
                </div>
              </div>
            </div>
          </Card>
        )}

        {tab === 'employment' && (
          <Card title="Employment Details">
            <div className="grid grid-2">
              {!isEdit && (
                <FormGroup label="User ID (Account Link)" required hint="The user account to link this employee to">
                  <input className="form-input" placeholder="User UUID" value={form.userId} onChange={e => set('userId', e.target.value)} required={!isEdit} />
                </FormGroup>
              )}
              <FormGroup label="Designation">
                <input className="form-input" placeholder="Software Engineer" value={form.designation} onChange={e => set('designation', e.target.value)} />
              </FormGroup>
              <FormGroup label="Department">
                <select className="form-input form-select" value={form.departmentId} onChange={e => set('departmentId', e.target.value)}>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </FormGroup>
              <FormGroup label="Joining Date">
                <input className="form-input" type="date" value={form.joiningDate} onChange={e => set('joiningDate', e.target.value)} />
              </FormGroup>
              <FormGroup label="Salary (₹)" hint="Annual CTC in rupees">
                <input className="form-input" type="number" placeholder="600000" value={form.salary} onChange={e => set('salary', e.target.value)} />
              </FormGroup>
            </div>
          </Card>
        )}

        {tab === 'skills' && (
          <Card title="Skills & Expertise">
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Select skills and set proficiency levels</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {skills.map(skill => {
                const selected = selectedSkills.find(s => s.skillId === skill.id);
                return (
                  <div key={skill.id} onClick={() => handleSkillToggle(skill.id)}
                    style={{ padding: '7px 14px', borderRadius: 99, cursor: 'pointer', border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`, background: selected ? '#eff6ff' : '#fff', fontSize: 13, fontWeight: 500, transition: 'all .15s', color: selected ? 'var(--primary)' : 'var(--text-primary)' }}>
                    {skill.name}
                    <span style={{ fontSize: 10, marginLeft: 5, color: 'var(--text-muted)' }}>{skill.category}</span>
                  </div>
                );
              })}
            </div>
            {selectedSkills.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, marginBottom: 12 }}>Set Proficiency Levels</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedSkills.map(ss => {
                    const skill = skills.find(s => s.id === ss.skillId);
                    return (
                      <div key={ss.skillId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
                        <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{skill?.name}</span>
                        <select className="form-input form-select" style={{ width: 160 }} value={ss.level}
                          onChange={e => setSelectedSkills(prev => prev.map(s => s.skillId === ss.skillId ? { ...s, level: e.target.value } : s))}>
                          <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Expert">Expert</option>
                        </select>
                        <input className="form-input" type="number" min="0" max="30" placeholder="Yrs" style={{ width: 80 }} value={ss.yearsExp}
                          onChange={e => setSelectedSkills(prev => prev.map(s => s.skillId === ss.skillId ? { ...s, yearsExp: parseInt(e.target.value) } : s))} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        )}

        {tab === 'emergency' && (
          <Card title="Emergency Contact">
            <div className="grid grid-2">
              {[['name', 'Contact Name'], ['relationship', 'Relationship'], ['phone', 'Phone Number'], ['email', 'Email Address']].map(([k, lbl]) => (
                <FormGroup key={k} label={lbl}>
                  <input className="form-input" placeholder={lbl} />
                </FormGroup>
              ))}
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><Save size={15} /> {isEdit ? 'Save Changes' : 'Create Employee'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
