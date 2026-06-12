import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { leaveAPI } from '../../api/services';
import { Card, PageHeader, StatusBadge, Pagination, Modal, EmptyState, Avatar } from '../../components/common/UI';
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function LeaveApprovals() {
  const { user } = useSelector(s => s.auth);
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING');
  const [actionModal, setActionModal] = useState(null); // { leave, action }
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  const isHR = ['HR', 'ADMIN'].includes(user?.role);
  const isManager = user?.role === 'MANAGER';

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leaveAPI.getAll({ page, limit: 10, status: status || undefined });
      setLeaves(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleAction = async () => {
    if (!actionModal) return;
    setProcessing(true);
    try {
      const { leave, action } = actionModal;
      if (isHR && leave.status === 'MANAGER_APPROVED') {
        await leaveAPI.hrAction(leave.id, { action, comment });
      } else {
        await leaveAPI.managerAction(leave.id, { action, comment });
      }
      toast.success(`Leave ${action}d successfully`);
      setActionModal(null);
      setComment('');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const canApprove = (leave) => {
    if (isHR && leave.status === 'MANAGER_APPROVED') return true;
    if (isManager && leave.status === 'PENDING') return true;
    if (user?.role === 'ADMIN') return ['PENDING', 'MANAGER_APPROVED'].includes(leave.status);
    return false;
  };

  return (
    <div>
      <PageHeader
        title="Leave Approvals"
        subtitle={`${pagination?.total || 0} applications ${status ? `with status: ${status.replace('_', ' ')}` : ''}`}
      />

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { val: 'PENDING', label: 'Pending', color: '#d97706' },
          { val: 'MANAGER_APPROVED', label: 'Manager Approved', color: '#1e40af' },
          { val: 'HR_APPROVED', label: 'HR Approved', color: '#16a34a' },
          { val: '', label: 'All', color: '#64748b' },
        ].map(s => (
          <button key={s.val} onClick={() => { setStatus(s.val); setPage(1); }}
            className={`btn btn-sm ${status === s.val ? 'btn-primary' : 'btn-secondary'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <Card noPad>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
        ) : leaves.length === 0 ? (
          <EmptyState icon={Clock} title="No leave applications" message={`No applications with status: ${status || 'any'}`} />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th><th>Department</th><th>Type</th><th>From</th><th>To</th>
                  <th>Days</th><th>Reason</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar src={l.employee?.profileImage} name={`${l.employee?.firstName} ${l.employee?.lastName}`} size={32} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{l.employee?.firstName} {l.employee?.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.employee?.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{l.employee?.department?.name || '—'}</td>
                    <td><StatusBadge status={l.leaveType} /></td>
                    <td style={{ fontSize: 12 }}>{format(new Date(l.startDate), 'dd MMM yyyy')}</td>
                    <td style={{ fontSize: 12 }}>{format(new Date(l.endDate), 'dd MMM yyyy')}</td>
                    <td style={{ fontWeight: 600, textAlign: 'center' }}>{l.totalDays}</td>
                    <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>
                      {canApprove(l) ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-success btn-sm" onClick={() => setActionModal({ leave: l, action: 'approve' })}>
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setActionModal({ leave: l, action: 'reject' })}>
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
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

      {/* Action Modal */}
      <Modal
        open={!!actionModal}
        onClose={() => { setActionModal(null); setComment(''); }}
        title={`${actionModal?.action === 'approve' ? 'Approve' : 'Reject'} Leave Application`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setActionModal(null); setComment(''); }} disabled={processing}>Cancel</button>
            <button className={`btn ${actionModal?.action === 'approve' ? 'btn-success' : 'btn-danger'}`} onClick={handleAction} disabled={processing}>
              {processing ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : actionModal?.action === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </>
        }
      >
        {actionModal && (
          <div>
            <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{actionModal.leave.employee?.firstName} {actionModal.leave.employee?.lastName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {actionModal.leave.leaveType.replace('_', ' ')} • {format(new Date(actionModal.leave.startDate), 'dd MMM')} – {format(new Date(actionModal.leave.endDate), 'dd MMM yyyy')} • {actionModal.leave.totalDays} days
              </div>
              <div style={{ fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>"{actionModal.leave.reason}"</div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MessageSquare size={13} /> Comment {actionModal.action === 'reject' && <span style={{ color: 'var(--danger)' }}>*</span>}
              </label>
              <textarea className="form-input" placeholder={actionModal.action === 'approve' ? 'Optional approval note...' : 'Reason for rejection...'} value={comment}
                onChange={e => setComment(e.target.value)} rows={3} required={actionModal.action === 'reject'} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
