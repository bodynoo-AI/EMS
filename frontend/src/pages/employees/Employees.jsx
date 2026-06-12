import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { UserPlus, Edit2, Trash2, Eye, Users } from 'lucide-react';
import { employeeAPI, departmentAPI } from '../../api/services';
import { Card, PageHeader, StatusBadge, Pagination, SearchInput, ConfirmDialog, Avatar, EmptyState } from '../../components/common/UI';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Employees() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ departmentId: '', isActive: 'true' });
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await employeeAPI.getAll({ page, limit: 12, search, ...filters });
      setEmployees(data.data);
      setPagination(data.pagination);
    } catch (e) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { departmentAPI.getAll().then(r => setDepartments(r.data.data)); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeAPI.delete(deleteId);
      toast.success('Employee deactivated');
      setDeleteId(null);
      fetchEmployees();
    } catch (e) {
      toast.error('Failed to deactivate');
    } finally {
      setDeleting(false);
    }
  };

  const canEdit = ['ADMIN', 'HR'].includes(user?.role);

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${pagination?.total || 0} employees found`}
        actions={canEdit && (
          <Link to="/employees/new" className="btn btn-primary">
            <UserPlus size={16} /> Add Employee
          </Link>
        )}
      />

      <Card noPad>
        {/* Filters */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search name, email, ID..." />
          <select className="form-input form-select" style={{ width: 200 }} value={filters.departmentId}
            onChange={e => { setFilters({ ...filters, departmentId: e.target.value }); setPage(1); }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="form-input form-select" style={{ width: 140 }} value={filters.isActive}
            onChange={e => { setFilters({ ...filters, isActive: e.target.value }); setPage(1); }}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
            <option value="">All</option>
          </select>
        </div>

        <div className="table-container">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : employees.length === 0 ? (
            <EmptyState icon={Users} title="No employees found" message="Try adjusting your search or filters"
              action={canEdit && <Link to="/employees/new" className="btn btn-primary">Add Employee</Link>} />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee</th><th>ID</th><th>Department</th><th>Designation</th>
                  <th>Role</th><th>Joined</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar src={emp.profileImage} name={`${emp.firstName} ${emp.lastName}`} size={36} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.firstName} {emp.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><code style={{ fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{emp.employeeId}</code></td>
                    <td style={{ fontSize: 13 }}>{emp.department?.name || '—'}</td>
                    <td style={{ fontSize: 13 }}>{emp.designation || '—'}</td>
                    <td><StatusBadge status={emp.user?.role} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {emp.joiningDate ? format(new Date(emp.joiningDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td>
                      <span className={`badge ${emp.isActive ? 'badge-green' : 'badge-red'}`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate(`/employees/${emp.id}`)} title="View">
                          <Eye size={15} />
                        </button>
                        {canEdit && (
                          <>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate(`/employees/${emp.id}/edit`)} title="Edit">
                              <Edit2 size={15} />
                            </button>
                            <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(emp.id)} title="Deactivate">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Deactivate Employee" loading={deleting} danger
        message="This will deactivate the employee's account. They will no longer be able to login. This action can be reversed."
      />
    </div>
  );
}
