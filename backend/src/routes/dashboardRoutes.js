const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const dashboardService = require('../services/dashboardService');
const { sendSuccess, sendError } = require('../utils/response');

router.use(protect);

router.get('/admin', authorize('ADMIN', 'HR'), async (req, res) => {
  const data = await dashboardService.getAdminDashboard();
  return sendSuccess(res, data);
});

router.get('/manager', authorize('MANAGER', 'ADMIN'), async (req, res) => {
  if (!req.user.employee) return sendError(res, 'Employee profile required', 404);
  const data = await dashboardService.getManagerDashboard(req.user.employee.id);
  return sendSuccess(res, data);
});

router.get('/employee', async (req, res) => {
  if (!req.user.employee) return sendError(res, 'Employee profile required', 404);
  const data = await dashboardService.getEmployeeDashboard(req.user.employee.id);
  return sendSuccess(res, data);
});

module.exports = router;
