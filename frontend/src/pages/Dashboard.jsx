import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, Calendar, Package, Building2, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardAPI } from '../api/services';
import { StatCard, Card, PageHeader, StatusBadge, Avatar, LoadingPage } from '../components/common/UI';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#1e40af', '#0891b2', '#7c3aed', '#16a34a', '#d97706', '#dc2626', '#0f766e', '#9333ea'];

export default function Dashboard() {
  const { user } = useSelector(s => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        let res;
        if (['ADMIN', 'HR'].includes(user?.role)) res = await dashboardAPI.getAdmin();
        else if (user?.role === 'MANAGER') res = await dashboardAPI.getManager();
        else res = await dashboardAPI.getEmployee();
        setData(res.data.data);
      } catch (e) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  if (loading) return <LoadingPage />;

  const name = user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email?.split('@')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (['ADMIN', 'HR'].includes(user?.role)) return <AdminDashboard data={data} name={name} greeting={greeting} />;
  if (user?.role === 'MANAGER') return <ManagerDashboard data={data} name={name} greeting={greeting} />;
  return <EmployeeDashboard data={data} name={name} greeting={greeting} />;
}

function AdminDashboard({ data, name, greeting }) {
  if (!data) return <LoadingPage />;
  const { stats, recentJoins, deptStats, assetsByType } = data;

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${name}! 👋`}
        subtitle="Here's what's happening across your organization today."
      />

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total Employees" value={stats.totalEmployees} icon={Users} color="#1e40af" sub={`${stats.activeEmployees} active`} />
        <StatCard label="Departments" value={stats.totalDepts} icon={Building2} color="#0891b2" />
        <StatCard label="Pending Leaves" value={stats.pendingLeaves} icon={Clock} color="#d97706" sub="Awaiting approval" />
        <StatCard label="Assets Allocated" value={stats.allocatedAssets} icon={Package} color="#7c3aed" sub={`${stats.availableAssets} available`} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <Card title="Department Headcount" subtitle="Active employees by department" noPad>
          <div style={{ padding: '10px 0 14px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptStats} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="count" fill="#1e40af" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Assets by Type" subtitle="Allocation breakdown" noPad>
          <div style={{ padding: '10px 0 14px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={assetsByType} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="type" label={({ type, percent }) => `${type.slice(0, 3)} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {assetsByType?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Recent Joiners" subtitle="Last 30 days"
        actions={<Link to="/employees" className="btn btn-secondary btn-sm">View All</Link>}>
        {recentJoins?.length === 0 ? (
          <div className="text-muted text-sm">No recent joiners</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentJoins?.map(emp => (
              <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar src={emp.profileImage} name={`${emp.firstName} ${emp.lastName}`} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.firstName} {emp.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.designation || 'Employee'}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {emp.joiningDate ? format(new Date(emp.joiningDate), 'dd MMM yyyy') : '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ManagerDashboard({ data, name, greeting }) {
  if (!data) return <LoadingPage />;
  const { stats, teamLeaves } = data;

  return (
    <div>
      <PageHeader title={`${greeting}, ${name}! 👋`} subtitle="Your team overview" />
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <StatCard label="Team Size" value={stats.teamSize} icon={Users} color="#1e40af" />
        <StatCard label="Pending Approvals" value={stats.pendingApprovals} icon={Clock} color="#d97706" />
        <StatCard label="On Leave Today" value="—" icon={Calendar} color="#0891b2" />
      </div>
      <Card title="Pending Leave Requests" actions={<Link to="/leaves/approvals" className="btn btn-primary btn-sm">View All</Link>}>
        {teamLeaves?.length === 0 ? (
          <div className="empty-state"><CheckCircle size={32} /><p>No pending approvals</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {teamLeaves.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar src={l.employee?.profileImage} name={`${l.employee?.firstName} ${l.employee?.lastName}`} size={30} />
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{l.employee?.firstName} {l.employee?.lastName}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={l.leaveType} /></td>
                    <td style={{ fontSize: 12 }}>{format(new Date(l.startDate), 'dd MMM')} – {format(new Date(l.endDate), 'dd MMM yyyy')}</td>
                    <td>{l.totalDays}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td><Link to="/leaves/approvals" className="btn btn-primary btn-sm">Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function EmployeeDashboard({ data, name, greeting }) {
  if (!data) return <LoadingPage />;
  const { stats, leaveBalances, recentLeaves, allocatedAssets, employee } = data;

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #1e40af, #0891b2)', borderRadius: 14, padding: '24px 28px', marginBottom: 24, color: '#fff', display: 'flex', alignItems: 'center', gap: 20 }}>
        <Avatar src={employee?.profileImage} name={`${employee?.firstName} ${employee?.lastName}`} size={60} />
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>{greeting}, {name}! 👋</h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>{employee?.designation || 'Employee'} • {employee?.department?.name || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Leaves Available" value={stats.leavesAvailable} icon={CheckCircle} color="#16a34a" />
        <StatCard label="Leaves Taken" value={stats.leavesTaken} icon={Calendar} color="#d97706" />
        <StatCard label="Pending Requests" value={stats.pendingLeaves} icon={Clock} color="#7c3aed" />
        <StatCard label="Assigned Assets" value={stats.allocatedAssetsCount} icon={Package} color="#1e40af" />
      </div>

      <div className="grid grid-2">
        <Card title="Leave Balances" actions={<Link to="/leaves/apply" className="btn btn-primary btn-sm">Apply Leave</Link>}>
          {leaveBalances?.map(b => (
            <div key={b.id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{b.leaveType.replace('_', ' ')}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.totalDays - b.usedDays - b.pendingDays} / {b.totalDays} days left</span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--primary)', borderRadius: 99, width: `${((b.usedDays + b.pendingDays) / b.totalDays) * 100}%` }} />
              </div>
            </div>
          ))}
        </Card>

        <Card title="My Recent Leaves">
          {recentLeaves?.length === 0 ? (
            <div className="text-muted text-sm">No leave history</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentLeaves?.map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{l.leaveType.replace('_', ' ')}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(l.startDate), 'dd MMM')} – {format(new Date(l.endDate), 'dd MMM')}</div>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {allocatedAssets?.length > 0 && (
        <Card title="My Assigned Assets" style={{ marginTop: 20 }}>
          <div className="grid grid-3">
            {allocatedAssets.map(a => (
              <div key={a.id} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)' }}>
                <Package size={20} color="var(--primary)" style={{ marginBottom: 6 }} />
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.asset.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.asset.assetTag} • {a.asset.assetType}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
