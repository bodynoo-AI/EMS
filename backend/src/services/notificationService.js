const prisma = require('../config/database');

class NotificationService {
  async create({ userId, type, title, message, data }) {
    return prisma.notification.create({
      data: { userId, type, title, message, data },
    });
  }

  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly } = {}) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { userId, ...(unreadOnly === 'true' && { isRead: false }) };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount };
  }

  async markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}

module.exports = new NotificationService();
