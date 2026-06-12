import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveAPI } from '../../api/services';
import { Card, PageHeader, FormGroup } from '../../components/common/UI';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { differenceInBusinessDays, parseISO } from 'date-fns';

export default function LeaveApply() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '', isHalfDay: false,
  });
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(0);

  useEffect(() => {
    leaveAPI.getBalance().then(r => setBalances(r.data.data || []));
  }, []);

  useEffect(() => {
    if (form.startDate && form.endDate && !form.isHalfDay) {
      const d = differenceInBusinessDays(parseISO(form.endDate), parseISO(form.startDate)) + 1;
      setDays(Math.max(0, d));
    } else if (form.isHalfDay) {
      setDays(0.5);
    } else {
      setDays(0);
    }
  }, [form.startDate, form.endDate, form.isHalfDay]);

  const balance = balances.find(b => b.leaveType === form.leaveType);
  const available = balance ? balance.totalDays - balance.usedDays - balance.pendingDays : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) return toast.error('Please select dates');
    if (!form.reason.trim()) return toast.error('Please provide a reason');
    setLoading(true);
    try {
      await leaveAPI.apply(form);
      toast.success('Leave application submitted successfully!');
      navigate('/leaves');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const LEAVE_TYPES = [
    { value: 'ANNUAL', label: 'Annual Leave', desc: 'Planned vacation or personal time off' },
    { value: 'SICK', label: 'Sick Leave', desc: 'Medical illness or health-related absence' },
    { value: 'CASUAL', label: 'Casual Leave', desc: 'Short unplanned absence' },
    { value: 'MATERNITY', label: 'Maternity Leave', desc: 'Paid leave for new mothers' },
    { value: 'PATERNITY', label: 'Paternity Leave', desc: 'Paid leave for new fathers' },
    { value: 'COMPENSATORY', label: 'Compensatory Leave', desc: 'In lieu of overtime worked' },
    { value: 'UNPAID', label: 'Unpaid Leave', desc: 'Leave without pay' },
  ];

  return (
    <div>
      <PageHeader
        title="Apply for Leave"
        subtitle="Submit your leave application for approval"
        actions={<button className="btn btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>}
      />

      <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <form onSubmit={handleSubmit}>
          <Card title="Leave Details" style={{ marginBottom: 16 }}>
            <FormGroup label="Leave Type" required>
              <select className="form-input form-select" value={form.leaveType} onChange={e => set('leaveType', e.target.value)}>
                {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="form-hint">{LEAVE_TYPES.find(t => t.value === form.leaveType)?.desc}</div>
            </FormGroup>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <input type="checkbox" id="halfDay" checked={form.isHalfDay} onChange={e => set('isHalfDay', e.target.checked)} style={{ width: 16, height: 16 }} />
              <label htmlFor="halfDay" style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Half Day Leave</label>
            </div>

            <div className="grid grid-2">
              <FormGroup label="Start Date" required>
                <input className="form-input" type="date" value={form.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => { set('startDate', e.target.value); if (!form.endDate || e.target.value > form.endDate) set('endDate', e.target.value); }} required />
              </FormGroup>
              <FormGroup label="End Date" required>
                <input className="form-input" type="date" value={form.endDate} min={form.startDate || new Date().toISOString().split('T')[0]}
                  onChange={e => set('endDate', e.target.value)} required disabled={form.isHalfDay} />
              </FormGroup>
            </div>

            {days > 0 && (
              <div style={{ padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                📅 <strong>{days} working day{days !== 1 ? 's' : ''}</strong> requested
                {available < days && <span style={{ color: 'var(--danger)', marginLeft: 8 }}>⚠ Insufficient balance</span>}
              </div>
            )}

            <FormGroup label="Reason" required>
              <textarea className="form-input" placeholder="Describe the reason for your leave..."
                value={form.reason} onChange={e => set('reason', e.target.value)} rows={4} required />
            </FormGroup>
          </Card>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || (days > 0 && available < days)}>
              {loading ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><Send size={15} /> Submit Application</>}
            </button>
          </div>
        </form>

        {/* Balance Summary */}
        <div>
          <Card title="Leave Balance Summary">
            {balances.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No leave balance found</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {balances.map(b => {
                  const avail = b.totalDays - b.usedDays - b.pendingDays;
                  const isSelected = b.leaveType === form.leaveType;
                  return (
                    <div key={b.id} style={{
                      padding: '10px 12px', borderRadius: 8, border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {b.leaveType.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: avail <= 2 ? 'var(--danger)' : 'var(--success)' }}>{avail} left</span>
                      </div>
                      <div style={{ height: 5, background: '#e2e8f0', borderRadius: 99 }}>
                        <div style={{ height: '100%', background: avail <= 2 ? 'var(--danger)' : 'var(--primary)', borderRadius: 99, width: `${Math.max(0, Math.min(100, (avail / b.totalDays) * 100))}%` }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                        {b.usedDays} used / {b.totalDays} total {b.pendingDays > 0 && `• ${b.pendingDays} pending`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Leave Policy" style={{ marginTop: 16 }}>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li>Apply at least 2 days in advance for planned leaves</li>
              <li>Sick leave requires a medical certificate for 3+ days</li>
              <li>Approval flow: Manager → HR → Final Approval</li>
              <li>Weekends and holidays are excluded from count</li>
              <li>Unutilized annual leave can be carried forward (max 10 days)</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
