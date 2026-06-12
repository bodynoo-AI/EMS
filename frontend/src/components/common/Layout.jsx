import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  LayoutDashboard, Users, Calendar, Package, Building2, Star,
  FileBarChart, Shield, Bell, User, LogOut, Menu, X, ChevronDown,
  Briefcase
} from 'lucide-react';

const NAV = [
  { label: 'MAIN', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { label: 'PEOPLE', items: [
    { to: '/employees', icon: Users, label: 'Employees', roles: ['ADMIN','HR','MANAGER'] },
    { to: '/profile', icon: User, label: 'My Profile' },
  ]},
  { label: 'LEAVE', items: [
    { to: '/leaves', icon: Calendar, label: 'My Leaves' },
    { to: '/leaves/apply', icon: Calendar, label: 'Apply Leave' },
    { to: '/leaves/approvals', icon: Calendar, label: 'Approvals', roles: ['ADMIN','HR','MANAGER'] },
  ]},
  { label: 'ASSETS', items: [
    { to: '/assets', icon: Package, label: 'Assets' },
  ]},
  { label: 'ADMIN', roles: ['ADMIN','HR'], items: [
    { to: '/departments', icon: Building2, label: 'Departments', roles: ['ADMIN','HR'] },
    { to: '/skills', icon: Star, label: 'Skills', roles: ['ADMIN','HR'] },
    { to: '/reports', icon: FileBarChart, label: 'Reports', roles: ['ADMIN','HR'] },
    { to: '/audit-logs', icon: Shield, label: 'Audit Logs', roles: ['ADMIN','HR'] },
  ]},
];

const ROLE_COLORS = {
  SUPER_ADMIN: 'badge-purple', ADMIN: 'badge-blue', HR: 'badge-cyan',
  MANAGER: 'badge-yellow', EMPLOYEE: 'badge-green'
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const initials = user ? `${user.employee?.firstName?.[0] || user.email[0]}${user.employee?.lastName?.[0] || ''}`.toUpperCase() : '?';

  const AvatarBg = ['#1e40af','#0891b2','#7c3aed','#16a34a','#d97706'];
  const avatarBg = AvatarBg[user?.email?.charCodeAt(0) % AvatarBg.length];

  return (
    <div className="app-layout">
      {/* Overlay */}
      {sidebarOpen && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99}} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#3b82f6,#1e40af)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Briefcase size={18} color="#fff" />
            </div>
            <div>
              <div style={{color:'#fff',fontWeight:700,fontSize:15,lineHeight:1}}>EMS Portal</div>
              <div style={{color:'#64748b',fontSize:11,marginTop:2}}>Enterprise Suite</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(section => {
            const visibleItems = section.items.filter(item =>
              !item.roles || item.roles.includes(user?.role)
            );
            if ((section.roles && !section.roles.includes(user?.role)) || visibleItems.length === 0) return null;
            return (
              <div key={section.label}>
                <div className="nav-section">{section.label}</div>
                {visibleItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({isActive}) => `nav-item${isActive ? ' active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                    end={item.to === '/dashboard'}
                  >
                    <item.icon size={17} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Sidebar User */}
        <div className="sidebar-user">
          <div className="avatar-placeholder" style={{width:36,height:36,background:avatarBg,color:'#fff',fontSize:13,flexShrink:0}}>
            {user?.employee?.profileImage
              ? <img src={user.employee.profileImage} alt="" className="avatar" style={{width:36,height:36}} />
              : initials}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:'#e2e8f0',fontSize:13,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
              {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email}
            </div>
            <div style={{fontSize:11,color:'#64748b'}}>{user?.role}</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} style={{display:'none'}}
              id="mob-menu">
              <Menu size={20} />
            </button>
            <div style={{fontSize:13,color:'var(--text-muted)'}}>
              {new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}
            </div>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <NavLink to="/notifications" className="btn btn-ghost btn-icon" style={{position:'relative'}}>
              <Bell size={19} />
            </NavLink>

            <div style={{position:'relative'}}>
              <button
                className="btn btn-ghost"
                style={{gap:8,padding:'6px 10px'}}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="avatar-placeholder" style={{width:30,height:30,background:avatarBg,color:'#fff',fontSize:12}}>
                  {user?.employee?.profileImage
                    ? <img src={user.employee.profileImage} alt="" className="avatar" style={{width:30,height:30}} />
                    : initials}
                </div>
                <span style={{fontSize:13,fontWeight:600}}>
                  {user?.employee?.firstName || user?.email?.split('@')[0]}
                </span>
                <ChevronDown size={14} />
              </button>

              {userMenuOpen && (
                <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',background:'#fff',border:'1px solid var(--border)',borderRadius:10,width:200,boxShadow:'var(--shadow-md)',zIndex:100}}>
                  <div style={{padding:'12px 14px',borderBottom:'1px solid var(--border)'}}>
                    <div style={{fontSize:13,fontWeight:600}}>{user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email}</div>
                    <span className={`badge ${ROLE_COLORS[user?.role]} mt-1`}>{user?.role}</span>
                  </div>
                  <NavLink to="/profile" className="nav-item" style={{padding:'10px 14px',color:'var(--text-primary)'}} onClick={() => setUserMenuOpen(false)}>
                    <User size={15} /> My Profile
                  </NavLink>
                  <button className="nav-item" style={{padding:'10px 14px',color:'var(--danger)',width:'100%',borderTop:'1px solid var(--border)'}} onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mob-menu { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
