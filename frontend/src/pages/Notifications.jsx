import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../api/services';
import { Card, PageHeader, LoadingPage } from '../components/common/UI';
import { Bell, CheckCheck, Calendar, Package, User, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  LEAVE_APPLIED: { icon: Calendar, color: '#d97706', bg: '#fef9c3' },
  LEAVE_APPROVED: { icon: CheckCheck, color: '#16a34a', bg: '#dcfce7' },
  LEAVE_REJECTED: { icon: AlertCircle, color: '#dc2626', bg: '#fee2e2' },
  ASSET_ASSIGNED: { icon: Package, color: '#0891b2', bg: '#cffafe' },
  ASSET_RETURNED: { icon: Package, color: '#7c3aed', bg: '#ede9fe' },
  PROFILE_UPDATED: { icon: User, color: '#1e40af', bg: '#dbeafe' },
  SYSTEM: { icon: Bell, color: '#64748b', bg: '#f1f5f9' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll({ limit: 50, unreadOnly: filter === 'unread' ? 'true' : undefined });
      setNotifications(res.data.data.notifications);
      setUnreadCount(res.data.data.unreadCount);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch { toast.error('Failed to mark as read'); }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed to mark all as read'); }
    finally { setMarkingAll(false); }
  };

  if (loading) return <LoadingPage />;

  const grouped = notifications.reduce((acc, n) => {
    const date = new Date(n.createdAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(n);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
        actions={
          unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead} disabled={markingAll}>
              {markingAll ? <div className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><CheckCheck size={14} /> Mark all read</>}
            </button>
          )
        }
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'unread'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Bell size={48} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
            <h3>No notifications</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {filter === 'unread' ? "You're all caught up!" : "No notifications yet."}
            </p>
          </div>
        </Card>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              {new Date(date).toDateString() === new Date().toDateString() ? 'Today' :
               new Date(date).toDateString() === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' : date}
            </div>
            <Card noPad>
              {items.map((notif, idx) => {
                const typeInfo = TYPE_ICONS[notif.type] || TYPE_ICONS.SYSTEM;
                const Icon = typeInfo.icon;
                return (
                  <div key={notif.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
                      borderBottom: idx < items.length - 1 ? '1px solid #f8fafc' : 'none',
                      background: notif.isRead ? 'transparent' : '#f8fbff',
                      cursor: notif.isRead ? 'default' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: typeInfo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} color={typeInfo.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: notif.isRead ? 500 : 700, fontSize: 14 }}>{notif.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                          {!notif.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                        </div>
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{notif.message}</p>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
