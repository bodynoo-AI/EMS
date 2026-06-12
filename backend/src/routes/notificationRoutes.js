const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/response');

router.use(protect);

router.get('/', async (req, res) => {
  const { page, limit, unreadOnly } = req.query;
  const result = await notificationService.getUserNotifications(req.user.id, { page, limit, unreadOnly });
  return sendSuccess(res, result);
});

router.patch('/:id/read', async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.user.id);
  return sendSuccess(res, null, 'Notification marked as read');
});

router.patch('/read-all', async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  return sendSuccess(res, null, 'All notifications marked as read');
});

module.exports = router;
