import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetAPI } from '../../api/services';
import { Card, PageHeader, FormGroup } from '../../components/common/UI';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', assetType: 'LAPTOP', brand: '', model: '', serialNumber: '',
    purchaseDate: '', purchaseCost: '', warrantyExpiry: '', condition: 'Good',
    location: '', notes: '',
  });

  useEffect(() => {
    if (isEdit) {
      assetAPI.getById(id).then(r => {
        const a = r.data.data;
        setForm({
          name: a.name || '', assetType: a.assetType || 'LAPTOP',
          brand: a.brand || '', model: a.model || '', serialNumber: a.serialNumber || '',
          purchaseDate: a.purchaseDate ? a.purchaseDate.split('T')[0] : '',
          purchaseCost: a.purchaseCost || '', warrantyExpiry: a.warrantyExpiry ? a.warrantyExpiry.split('T')[0] : '',
          condition: a.condition || 'Good', location: a.location || '', notes: a.notes || '',
        });
      });
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) { await assetAPI.update(id, form); toast.success('Asset updated'); }
      else { await assetAPI.create(form); toast.success('Asset created'); }
      navigate('/assets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  const ASSET_TYPES = ['LAPTOP', 'MONITOR', 'KEYBOARD', 'MOUSE', 'HEADSET', 'PHONE', 'ID_CARD', 'ACCESS_CARD', 'OTHER'];

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Asset' : 'Add New Asset'}
        subtitle="Manage company asset details"
        actions={<button className="btn btn-secondary" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>}
      />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
          <Card title="Asset Details">
            <FormGroup label="Asset Name" required>
              <input className="form-input" placeholder="MacBook Pro 16-inch" value={form.name} onChange={e => set('name', e.target.value)} required />
            </FormGroup>
            <FormGroup label="Asset Type" required>
              <select className="form-input form-select" value={form.assetType} onChange={e => set('assetType', e.target.value)}>
                {ASSET_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </FormGroup>
            <div className="grid grid-2">
              <FormGroup label="Brand">
                <input className="form-input" placeholder="Apple, Dell, HP..." value={form.brand} onChange={e => set('brand', e.target.value)} />
              </FormGroup>
              <FormGroup label="Model">
                <input className="form-input" placeholder="Model number" value={form.model} onChange={e => set('model', e.target.value)} />
              </FormGroup>
            </div>
            <FormGroup label="Serial Number" hint="Must be unique across all assets">
              <input className="form-input" placeholder="SN-XXXXXXXX" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} />
            </FormGroup>
            <FormGroup label="Location">
              <input className="form-input" placeholder="Office Floor 2, Desk 14" value={form.location} onChange={e => set('location', e.target.value)} />
            </FormGroup>
            <FormGroup label="Condition">
              <select className="form-input form-select" value={form.condition} onChange={e => set('condition', e.target.value)}>
                {['New', 'Excellent', 'Good', 'Fair', 'Poor'].map(c => <option key={c}>{c}</option>)}
              </select>
            </FormGroup>
          </Card>

          <Card title="Financial & Warranty">
            <FormGroup label="Purchase Date">
              <input className="form-input" type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
            </FormGroup>
            <FormGroup label="Purchase Cost (₹)">
              <input className="form-input" type="number" placeholder="85000" value={form.purchaseCost} onChange={e => set('purchaseCost', e.target.value)} />
            </FormGroup>
            <FormGroup label="Warranty Expiry">
              <input className="form-input" type="date" value={form.warrantyExpiry} onChange={e => set('warrantyExpiry', e.target.value)} />
            </FormGroup>
            <FormGroup label="Notes">
              <textarea className="form-input" placeholder="Any additional information..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={4} />
            </FormGroup>
          </Card>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><Save size={15} /> {isEdit ? 'Save Changes' : 'Create Asset'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
