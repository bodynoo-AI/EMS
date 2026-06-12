import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assetAPI } from '../../api/services';
import { Card, PageHeader, StatusBadge, Avatar, LoadingPage } from '../../components/common/UI';
import { ArrowLeft, Package } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ASSET_TYPE_ICONS = { LAPTOP: '💻', MONITOR: '🖥️', KEYBOARD: '⌨️', MOUSE: '🖱️', PHONE: '📱', ID_CARD: '🪪', OTHER: '📦', HEADSET: '🎧', ACCESS_CARD: '💳' };

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assetAPI.getById(id)
      .then(r => setAsset(r.data.data))
      .catch(() => toast.error('Asset not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingPage />;
  if (!asset) return <div>Asset not found</div>;

  const currentAlloc = asset.allocations?.find(a => a.isActive);

  return (
    <div>
      <PageHeader
        title={asset.name}
        subtitle={`${asset.assetTag} • ${asset.assetType.replace('_', ' ')}`}
        actions={<button className="btn btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>}
      />

      <div className="grid grid-2" style={{ gap: 20, marginBottom: 20 }}>
        <Card title="Asset Information">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 60, height: 60, background: '#f0f4ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
              {ASSET_TYPE_ICONS[asset.assetType] || '📦'}
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px' }}>{asset.name}</h3>
              <StatusBadge status={asset.status} />
            </div>
          </div>
          {[
            ['Asset Tag', asset.assetTag, true],
            ['Type', asset.assetType.replace('_', ' ')],
            ['Brand', asset.brand || '—'],
            ['Model', asset.model || '—'],
            ['Serial Number', asset.serialNumber || '—', true],
            ['Condition', asset.condition || '—'],
            ['Location', asset.location || '—'],
            ['Purchase Date', asset.purchaseDate ? format(new Date(asset.purchaseDate), 'dd MMM yyyy') : '—'],
            ['Purchase Cost', asset.purchaseCost ? `₹${Number(asset.purchaseCost).toLocaleString('en-IN')}` : '—'],
            ['Warranty Expiry', asset.warrantyExpiry ? format(new Date(asset.warrantyExpiry), 'dd MMM yyyy') : '—'],
          ].map(([label, value, mono]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 13, fontFamily: mono ? 'monospace' : undefined }}>{value}</span>
            </div>
          ))}
          {asset.notes && (
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              {asset.notes}
            </div>
          )}
        </Card>

        <Card title="Current Assignment">
          {currentAlloc ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Avatar name={`${currentAlloc.employee.firstName} ${currentAlloc.employee.lastName}`} size={48} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{currentAlloc.employee.firstName} {currentAlloc.employee.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentAlloc.employee.employeeId}</div>
                </div>
              </div>
              <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', fontSize: 13 }}>
                <div>📅 Assigned: {format(new Date(currentAlloc.allocatedAt), 'dd MMM yyyy')}</div>
                {currentAlloc.notes && <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>📝 {currentAlloc.notes}</div>}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              <Package size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 13 }}>Not currently assigned</p>
            </div>
          )}
        </Card>
      </div>

      <Card title={`Allocation History (${asset.allocations?.length || 0})`} noPad>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Employee</th><th>Assigned On</th><th>Returned On</th><th>Condition</th><th>Notes</th><th>Status</th></tr>
            </thead>
            <tbody>
              {asset.allocations?.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No allocation history</td></tr>
              ) : asset.allocations?.map(alloc => (
                <tr key={alloc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={`${alloc.employee.firstName} ${alloc.employee.lastName}`} size={28} />
                      <span style={{ fontSize: 13 }}>{alloc.employee.firstName} {alloc.employee.lastName}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{format(new Date(alloc.allocatedAt), 'dd MMM yyyy')}</td>
                  <td style={{ fontSize: 12 }}>{alloc.returnedAt ? format(new Date(alloc.returnedAt), 'dd MMM yyyy') : '—'}</td>
                  <td style={{ fontSize: 12 }}>{alloc.condition || '—'}</td>
                  <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{alloc.notes || '—'}</td>
                  <td><span className={`badge ${alloc.isActive ? 'badge-green' : 'badge-gray'}`}>{alloc.isActive ? 'Active' : 'Returned'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
