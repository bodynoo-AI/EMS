import React, { useEffect, useState, useCallback } from 'react';
import { auditAPI } from '../api/services';
import { Card, PageHeader, Pagination, SearchInput } from '../components/common/UI';
import { Shield } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ACTION_COLORS = { CREATE: 'badge-green', UPDATE: 'badge-blue', DELETE: 'badge-red', LOGIN: 'badge-cyan', LOGOUT: 'badge-gray' };

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ tableName: '', action: '' });
  const [expanded, setExpanded] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditAPI.getLogs({ page, limit: 20, ...filters });
      setLogs(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load audit logs'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const TABLES = ['employees', 'leave_applications', 'assets', 'departments', 'users'];
  const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];

  return (
    <div>
      <PageHeader title="Audit Trail" subtitle="Track every data change across the system" />

      <Card noPad>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select className="form-input form-select" style={{ width: 160 }} value={filters.tableName} onChange={e => { setFilters({ ...filters, tableName: e.target.value }); setPage(1); }}>
            <option value="">All Tables</option>
            {TABLES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
          <select className="form-input form-select" style={{ width: 140 }} value={filters.action} onChange={e => { setFilters({ ...filters, action: e.target.value }); setPage(1); }}>
            <option value="">All Actions</option>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="table-container">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
          ) : (
            <table>
              <thead>
                <tr><th>User</th><th>Action</th><th>Table</th><th>Record ID</th><th>IP Address</th><th>Timestamp</th><th>Details</th></tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No audit logs found</td></tr>
                ) : logs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                      <td style={{ fontSize: 12 }}>
                        <div style={{ fontWeight: 500 }}>{log.user?.email}</div>
                        <span className={`badge ${log.user?.role === 'ADMIN' ? 'badge-blue' : 'badge-gray'}`} style={{ fontSize: 9 }}>{log.user?.role}</span>
                      </td>
                      <td><span className={`badge ${ACTION_COLORS[log.action] || 'badge-gray'}`}>{log.action}</span></td>
                      <td><code style={{ fontSize: 11 }}>{log.tableName}</code></td>
                      <td><code style={{ fontSize: 10, maxWidth: 120, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.recordId}</code></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.ipAddress || '—'}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {format(new Date(log.createdAt), 'dd MMM yyyy, HH:mm:ss')}
                      </td>
                      <td>
                        {(log.oldValues || log.newValues) && (
                          <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
                            {expanded === log.id ? '▲ Hide' : '▼ View'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded === log.id && (
                      <tr>
                        <td colSpan={7} style={{ padding: 0 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 16px', background: '#f8fafc' }}>
                            {log.oldValues && (
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', marginBottom: 6 }}>OLD VALUES</div>
                                <pre style={{ margin: 0, fontSize: 11, background: '#fff', padding: '8px 10px', borderRadius: 6, border: '1px solid #fecaca', overflow: 'auto', maxHeight: 200 }}>
                                  {JSON.stringify(log.oldValues, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.newValues && (
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', marginBottom: 6 }}>NEW VALUES</div>
                                <pre style={{ margin: 0, fontSize: 11, background: '#fff', padding: '8px 10px', borderRadius: 6, border: '1px solid #bbf7d0', overflow: 'auto', maxHeight: 200 }}>
                                  {JSON.stringify(log.newValues, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>
    </div>
  );
}
