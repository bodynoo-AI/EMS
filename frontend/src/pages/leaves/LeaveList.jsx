import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { leaveAPI } from '../../api/services';
import { Card, PageHeader, StatusBadge, Pagination, SearchInput, ConfirmDialog, LoadingPage, EmptyState } from '../../components/common/UI';
import { Calendar, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function LeaveList() {
  const { user } = useSelector(s => s.auth);
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const [leavesRes, balanceRes] = await Promise.all([
        leaveAPI.getAll({ page, limit: 10, status }),
        leaveAPI.getBalance(),
      ]);
      setLeaves(leavesRes.data.data);
      setPagination(leavesRes.data.pagination);
      setBalances(balanceRes.data.data || []);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await leaveAPI.cancel(cancelId);
      toast.success('Leave cancelled');
      setCancelId(null);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel this leave');
    } finally {
      setCancelling(false);
    }
  };

  const LEAVE_COLORS = { ANNUAL: '#1e40af', SICK: '#dc2626', CASUAL: '#d97706', MATERNITY: '#7c3aed', PATERNITY: '#0891b2', UNPAID: '#64748b' };

  return (
    <div>
      <PageHeader
        title="My Leaves"
        subtitle="Track and manage your leave applications"
        actions={<Link to="/leaves/apply" className="btn btn-primary"><Plus size={16} /> Apply Leave</Link>}
      />

      {/* Leave Balance Cards */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {balances.map(b => {
          const available = b.totalDays - b.usedDays - b.pendingDays;
          const color = LEAVE_COLORS[b.leaveType] || '#1e40af';
          return (
            <div key={b.id} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{b.leaveType.replace('_', ' ')}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.year}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color }}>{available}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                of {b.totalDays} days available
                {b.pendingDays > 0 && <span style={{ marginLeft: 4, color: '#d97706' }}>({b.pendingDays} pending)</span>}
              </div>
              <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99 }}>
                <div style={{ height: '100%', background: color, borderRadius: 99, width: `${Math.min(100, ((b.usedDays) / b.totalDays) * 100)}%`, opacity: 0.8 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>{b.usedDays} used • {b.pendingDays} pending</div>
            </div>
          );
        })}
      </div>

      <Card noPad>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, flex: 1 }}>Leave History</h3>
          <select className="form-input form-select" style={{ width: 180 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="MANAGER_APPROVED">Manager Approved</option>
            <option value="HR_APPROVED">HR Approved</option>
            <option value="MANAGER_REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
        ) : leaves.length === 0 ? (
          <EmptyState icon={Calendar} title="No leave applications" message="Apply for your first leave"
            action={<Link to="/leaves/apply" className="btn btn-primary"><Plus size={14} /> Apply Leave</Link>} />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Applied On</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td><StatusBadge status={l.leaveType} /></td>
                    <td style={{ fontSize: 13 }}>{format(new Date(l.startDate), 'dd MMM yyyy')}</td>
                    <td style={{ fontSize: 13 }}>{format(new Date(l.endDate), 'dd MMM yyyy')}</td>
                    <td style={{ fontWeight: 600 }}>{l.totalDays}</td>
                    <td style={{ fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(l.createdAt), 'dd MMM yyyy')}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>
                      {['PENDING', 'MANAGER_APPROVED'].includes(l.status) && (
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setCancelId(l.id)} title="Cancel">
                          <X size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>

      <ConfirmDialog open={!!cancelId} onClose={() => setCancelId(null)} onConfirm={handleCancel}
        title="Cancel Leave" loading={cancelling} danger
        message="Are you sure you want to cancel this leave application? Leave balance will be restored." />
    </div>
  );
}
