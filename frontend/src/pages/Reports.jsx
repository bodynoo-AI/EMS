import React, { useState } from 'react';
import { reportAPI, departmentAPI } from '../api/services';
import { Card, PageHeader } from '../components/common/UI';
import { FileBarChart, Download, FileSpreadsheet, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function Reports() {
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState('employees');
  const [filters, setFilters] = useState({
    employees: { departmentId: '', isActive: 'true' },
    leaves: { year: new Date().getFullYear().toString(), status: '', departmentId: '' },
    assets: { assetType: '', status: '' },
  });
  const [loading, setLoading] = useState({ json: false, csv: false, excel: false });
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    departmentAPI.getAll().then(r => setDepartments(r.data.data));
  }, []);

  const setFilter = (tab, key, val) => setFilters(f => ({ ...f, [tab]: { ...f[tab], [key]: val } }));

  const fetchPreview = async () => {
    setLoading(l => ({ ...l, json: true }));
    setPreviewData(null);
    try {
      let res;
      if (activeTab === 'employees') res = await reportAPI.getEmployeeReport(filters.employees);
      else if (activeTab === 'leaves') res = await reportAPI.getLeaveReport(filters.leaves);
      else res = await reportAPI.getAssetReport(filters.assets);
      setPreviewData(res.data.data?.slice(0, 20));
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(l => ({ ...l, json: false })); }
  };

  const downloadReport = async (format) => {
    setLoading(l => ({ ...l, [format]: true }));
    try {
      let res;
      const params = { ...filters[activeTab], format };
      if (activeTab === 'employees') res = await reportAPI.getEmployeeReport(params);
      else if (activeTab === 'leaves') res = await reportAPI.getLeaveReport(params);
      else res = await reportAPI.getAssetReport(params);

      const ext = format === 'excel' ? 'xlsx' : 'csv';
      const blob = new Blob([res.data], { type: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-report.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch { toast.error('Download failed'); }
    finally { setLoading(l => ({ ...l, [format]: false })); }
  };

  const REPORT_TABS = [
    { key: 'employees', label: 'Employee Report', icon: '👥' },
    { key: 'leaves', label: 'Leave Report', icon: '📅' },
    { key: 'assets', label: 'Asset Report', icon: '📦' },
  ];

  return (
    <div>
      <PageHeader title="Reports & Exports" subtitle="Generate and export comprehensive reports" />

      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        {REPORT_TABS.map(tab => (
          <div key={tab.key} onClick={() => { setActiveTab(tab.key); setPreviewData(null); }}
            style={{
              padding: '18px 20px', borderRadius: 12, border: `2px solid ${activeTab === tab.key ? 'var(--primary)' : 'var(--border)'}`,
              background: activeTab === tab.key ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'var(--transition)',
            }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{tab.icon}</div>
            <div style={{ fontWeight: 700, color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-primary)' }}>{tab.label}</div>
          </div>
        ))}
      </div>

      <Card title="Filters & Export"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchPreview} disabled={loading.json}>
              {loading.json ? <div className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><Filter size={13} /> Preview</>}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => downloadReport('csv')} disabled={loading.csv}>
              {loading.csv ? <div className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><Download size={13} /> CSV</>}
            </button>
            <button className="btn btn-success btn-sm" onClick={() => downloadReport('excel')} disabled={loading.excel}>
              {loading.excel ? <div className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><FileSpreadsheet size={13} /> Excel</>}
            </button>
          </div>
        }>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {activeTab === 'employees' && (
            <>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Department</label>
                <select className="form-input form-select" style={{ width: 200 }} value={filters.employees.departmentId} onChange={e => setFilter('employees', 'departmentId', e.target.value)}>
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Status</label>
                <select className="form-input form-select" style={{ width: 140 }} value={filters.employees.isActive} onChange={e => setFilter('employees', 'isActive', e.target.value)}>
                  <option value="true">Active</option><option value="false">Inactive</option><option value="">All</option>
                </select>
              </div>
            </>
          )}
          {activeTab === 'leaves' && (
            <>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Year</label>
                <select className="form-input form-select" style={{ width: 120 }} value={filters.leaves.year} onChange={e => setFilter('leaves', 'year', e.target.value)}>
                  {[2025, 2024, 2023, 2022].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Status</label>
                <select className="form-input form-select" style={{ width: 180 }} value={filters.leaves.status} onChange={e => setFilter('leaves', 'status', e.target.value)}>
                  <option value="">All Status</option>
                  <option value="HR_APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="HR_REJECTED">Rejected</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Department</label>
                <select className="form-input form-select" style={{ width: 200 }} value={filters.leaves.departmentId} onChange={e => setFilter('leaves', 'departmentId', e.target.value)}>
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </>
          )}
          {activeTab === 'assets' && (
            <>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Asset Type</label>
                <select className="form-input form-select" style={{ width: 160 }} value={filters.assets.assetType} onChange={e => setFilter('assets', 'assetType', e.target.value)}>
                  <option value="">All Types</option>
                  {['LAPTOP', 'MONITOR', 'KEYBOARD', 'MOUSE', 'PHONE', 'ID_CARD', 'OTHER'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Status</label>
                <select className="form-input form-select" style={{ width: 160 }} value={filters.assets.status} onChange={e => setFilter('assets', 'status', e.target.value)}>
                  <option value="">All Status</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ALLOCATED">Allocated</option>
                  <option value="UNDER_MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </>
          )}
        </div>
      </Card>

      {previewData && (
        <Card title={`Preview — ${previewData.length} records`} style={{ marginTop: 20 }} noPad>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {activeTab === 'employees' && ['ID', 'Name', 'Email', 'Department', 'Designation', 'Role', 'Status'].map(h => <th key={h}>{h}</th>)}
                  {activeTab === 'leaves' && ['Employee', 'Department', 'Type', 'From', 'To', 'Days', 'Status'].map(h => <th key={h}>{h}</th>)}
                  {activeTab === 'assets' && ['Tag', 'Name', 'Type', 'Brand', 'Serial', 'Status', 'Assigned To'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i}>
                    {activeTab === 'employees' && [
                      <td key="id"><code style={{ fontSize: 11 }}>{row.employeeId}</code></td>,
                      <td key="name" style={{ fontSize: 13 }}>{row.firstName} {row.lastName}</td>,
                      <td key="email" style={{ fontSize: 12 }}>{row.email}</td>,
                      <td key="dept" style={{ fontSize: 12 }}>{row.department?.name || '—'}</td>,
                      <td key="des" style={{ fontSize: 12 }}>{row.designation || '—'}</td>,
                      <td key="role"><span className="badge badge-blue">{row.user?.role}</span></td>,
                      <td key="status"><span className={`badge ${row.isActive ? 'badge-green' : 'badge-red'}`}>{row.isActive ? 'Active' : 'Inactive'}</span></td>,
                    ]}
                    {activeTab === 'leaves' && [
                      <td key="emp" style={{ fontSize: 13 }}>{row.employee?.firstName} {row.employee?.lastName}</td>,
                      <td key="dept" style={{ fontSize: 12 }}>{row.employee?.department?.name || '—'}</td>,
                      <td key="type"><span className="badge badge-blue">{row.leaveType}</span></td>,
                      <td key="from" style={{ fontSize: 12 }}>{row.startDate ? new Date(row.startDate).toLocaleDateString() : '—'}</td>,
                      <td key="to" style={{ fontSize: 12 }}>{row.endDate ? new Date(row.endDate).toLocaleDateString() : '—'}</td>,
                      <td key="days" style={{ fontWeight: 600 }}>{row.totalDays}</td>,
                      <td key="status"><span className="badge badge-gray">{row.status?.replace('_', ' ')}</span></td>,
                    ]}
                    {activeTab === 'assets' && [
                      <td key="tag"><code style={{ fontSize: 11 }}>{row.assetTag}</code></td>,
                      <td key="name" style={{ fontSize: 13 }}>{row.name}</td>,
                      <td key="type" style={{ fontSize: 12 }}>{row.assetType}</td>,
                      <td key="brand" style={{ fontSize: 12 }}>{row.brand || '—'}</td>,
                      <td key="serial"><code style={{ fontSize: 11 }}>{row.serialNumber || '—'}</code></td>,
                      <td key="status"><span className="badge badge-blue">{row.status}</span></td>,
                      <td key="assigned" style={{ fontSize: 12 }}>{row.allocations?.[0]?.employee ? `${row.allocations[0].employee.firstName} ${row.allocations[0].employee.lastName}` : '—'}</td>,
                    ]}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
