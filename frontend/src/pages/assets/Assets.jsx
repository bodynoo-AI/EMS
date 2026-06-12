import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { assetAPI, employeeAPI } from '../../api/services';
import { Card, PageHeader, StatusBadge, Pagination, SearchInput, EmptyState, StatCard, Modal, FormGroup, Avatar } from '../../components/common/UI';
import { Package, Plus, Eye, UserPlus, RotateCcw, Laptop, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';

const ASSET_TYPE_ICONS = { LAPTOP: '💻', MONITOR: '🖥️', KEYBOARD: '⌨️', MOUSE: '🖱️', PHONE: '📱', ID_CARD: '🪪', OTHER: '📦', HEADSET: '🎧', ACCESS_CARD: '💳' };

export default function Assets() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ assetType: '', status: '' });
  const [page, setPage] = useState(1);
  const [allocModal, setAllocModal] = useState(null);
  const [returnModal, setReturnModal] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allocForm, setAllocForm] = useState({ employeeId: '', notes: '' });
  const [returnForm, setReturnForm] = useState({ condition: 'Good', notes: '' });
  const [processing, setProcessing] = useState(false);

  const canManage = ['ADMIN', 'HR'].includes(user?.role);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const [assetsRes, statsRes] = await Promise.all([
        assetAPI.getAll({ page, limit: 12, search, ...filters }),
        canManage ? assetAPI.getStats() : Promise.resolve(null),
      ]);
      setAssets(assetsRes.data.data);
      setPagination(assetsRes.data.pagination);
      if (statsRes) setStats(statsRes.data.data);
    } catch {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  useEffect(() => {
    if (canManage) employeeAPI.getAll({ limit: 100, isActive: 'true' }).then(r => setEmployees(r.data.data));
  }, [canManage]);

  const handleAllocate = async () => {
    setProcessing(true);
    try {
      await assetAPI.allocate(allocModal.id, allocForm);
      toast.success('Asset allocated');
      setAllocModal(null);
      setAllocForm({ employeeId: '', notes: '' });
      fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Allocation failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReturn = async () => {
    setProcessing(true);
    try {
      const allocation = returnModal.allocations[0];
      await assetAPI.returnAsset(allocation.id, returnForm);
      toast.success('Asset returned');
      setReturnModal(null);
      setReturnForm({ condition: 'Good', notes: '' });
      fetchAssets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Asset Management"
        subtitle="Track and manage company assets"
        actions={canManage && <Link to="/assets/new" className="btn btn-primary"><Plus size={16} /> Add Asset</Link>}
      />

      {canManage && stats && (
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          <StatCard label="Total Assets" value={stats.total} icon={Package} color="#1e40af" />
          <StatCard label="Available" value={stats.available} icon={Package} color="#16a34a" />
          <StatCard label="Allocated" value={stats.allocated} icon={UserPlus} color="#d97706" />
          <StatCard label="Maintenance" value={stats.maintenance} icon={RotateCcw} color="#dc2626" />
        </div>
      )}

      <Card noPad>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search name, tag, serial..." />
          <select className="form-input form-select" style={{ width: 160 }} value={filters.assetType}
            onChange={e => { setFilters({ ...filters, assetType: e.target.value }); setPage(1); }}>
            <option value="">All Types</option>
            {['LAPTOP', 'MONITOR', 'KEYBOARD', 'MOUSE', 'PHONE', 'ID_CARD', 'HEADSET', 'OTHER'].map(t => (
              <option key={t} value={t}>{ASSET_TYPE_ICONS[t]} {t.replace('_', ' ')}</option>
            ))}
          </select>
          <select className="form-input form-select" style={{ width: 160 }} value={filters.status}
            onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}>
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="UNDER_MAINTENANCE">Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        <div className="table-container">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}><div className="loading-spinner" style={{ margin: '0 auto' }} /></div>
          ) : assets.length === 0 ? (
            <EmptyState icon={Package} title="No assets found" message="Try adjusting filters"
              action={canManage && <Link to="/assets/new" className="btn btn-primary">Add Asset</Link>} />
          ) : (
            <table>
              <thead>
                <tr><th>Asset</th><th>Tag</th><th>Type</th><th>Brand / Model</th><th>Status</th><th>Assigned To</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {assets.map(asset => {
                  const currentAllocation = asset.allocations?.[0];
                  return (
                    <tr key={asset.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, background: '#f0f4ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            {ASSET_TYPE_ICONS[asset.assetType] || '📦'}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{asset.name}</div>
                        </div>
                      </td>
                      <td><code style={{ fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{asset.assetTag}</code></td>
                      <td style={{ fontSize: 12 }}>{asset.assetType.replace('_', ' ')}</td>
                      <td style={{ fontSize: 12 }}>{[asset.brand, asset.model].filter(Boolean).join(' / ') || '—'}</td>
                      <td><StatusBadge status={asset.status} /></td>
                      <td>
                        {currentAllocation ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Avatar name={`${currentAllocation.employee.firstName} ${currentAllocation.employee.lastName}`} size={24} />
                            <span style={{ fontSize: 12 }}>{currentAllocation.employee.firstName} {currentAllocation.employee.lastName}</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unassigned</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate(`/assets/${asset.id}`)} title="View"><Eye size={14} /></button>
                          {canManage && asset.status === 'AVAILABLE' && (
                            <button className="btn btn-primary btn-sm" onClick={() => setAllocModal(asset)} title="Allocate">
                              <UserPlus size={13} /> Assign
                            </button>
                          )}
                          {canManage && asset.status === 'ALLOCATED' && (
                            <button className="btn btn-warning btn-sm" onClick={() => setReturnModal(asset)}>
                              <RotateCcw size={13} /> Return
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>

      {/* Allocate Modal */}
      <Modal open={!!allocModal} onClose={() => setAllocModal(null)} title={`Assign: ${allocModal?.name}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAllocModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAllocate} disabled={!allocForm.employeeId || processing}>
              {processing ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Assign Asset'}
            </button>
          </>
        }>
        <FormGroup label="Assign To" required>
          <select className="form-input form-select" value={allocForm.employeeId} onChange={e => setAllocForm({ ...allocForm, employeeId: e.target.value })}>
            <option value="">Select employee...</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Notes">
          <textarea className="form-input" placeholder="Any notes about this assignment..." value={allocForm.notes} onChange={e => setAllocForm({ ...allocForm, notes: e.target.value })} rows={3} />
        </FormGroup>
      </Modal>

      {/* Return Modal */}
      <Modal open={!!returnModal} onClose={() => setReturnModal(null)} title={`Return: ${returnModal?.name}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setReturnModal(null)}>Cancel</button>
            <button className="btn btn-warning" onClick={handleReturn} disabled={processing}>
              {processing ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Confirm Return'}
            </button>
          </>
        }>
        <FormGroup label="Asset Condition">
          <select className="form-input form-select" value={returnForm.condition} onChange={e => setReturnForm({ ...returnForm, condition: e.target.value })}>
            {['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'].map(c => <option key={c}>{c}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Return Notes">
          <textarea className="form-input" placeholder="Any issues or notes about the returned asset..." value={returnForm.notes} onChange={e => setReturnForm({ ...returnForm, notes: e.target.value })} rows={3} />
        </FormGroup>
      </Modal>
    </div>
  );
}
