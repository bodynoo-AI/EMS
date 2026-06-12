const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const leaveService = require('../services/leaveService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

router.use(protect);

// Get leave balance
router.get('/balance', async (req, res) => {
  if (!req.user.employee) return sendError(res, 'Employee not found', 404);
  const balances = await leaveService.getLeaveBalance(req.user.employee.id, req.query.year);
  return sendSuccess(res, balances);
});

router.get('/balance/:employeeId', authorize('ADMIN', 'HR', 'MANAGER'), async (req, res) => {
  const balances = await leaveService.getLeaveBalance(req.params.employeeId, req.query.year);
  return sendSuccess(res, balances);
});

// Apply for leave
router.post('/apply', async (req, res) => {
  if (!req.user.employee) return sendError(res, 'Employee not found', 404);
  const leave = await leaveService.applyLeave(req.user.employee.id, req.body);
  return sendSuccess(res, leave, 'Leave application submitted', 201);
});

// Get leaves
router.get('/', async (req, res) => {
  const { page, limit, status, leaveType } = req.query;
  let query = { page, limit, status, leaveType };

  if (req.user.role === 'EMPLOYEE') {
    query.employeeId = req.user.employee?.id;
  } else if (req.user.role === 'MANAGER') {
    query.managerId = req.user.employee?.id;
    if (req.query.myLeaves === 'true') query = { ...query, managerId: undefined, employeeId: req.user.employee?.id };
  }

  const result = await leaveService.getLeaves(query);
  return sendPaginated(res, result.leaves, result.pagination);
});

router.get('/:id', async (req, res) => {
  const leaves = await leaveService.getLeaves({ page: 1, limit: 1 });
  return sendSuccess(res, leaves.leaves[0]);
});

// Manager approval
router.post('/:id/manager-action', authorize('MANAGER', 'ADMIN'), async (req, res) => {
  const { action, comment } = req.body;
  const leave = await leaveService.managerAction(req.params.id, req.user.employee?.id, action, comment);
  return sendSuccess(res, leave, `Leave ${action}d by manager`);
});

// HR final approval
router.post('/:id/hr-action', authorize('HR', 'ADMIN'), async (req, res) => {
  const { action, comment } = req.body;
  const leave = await leaveService.hrAction(req.params.id, req.user.employee?.id, action, comment);
  return sendSuccess(res, leave, `Leave ${action}d by HR`);
});

// Cancel leave
router.post('/:id/cancel', async (req, res) => {
  if (!req.user.employee) return sendError(res, 'Employee not found', 404);
  const leave = await leaveService.cancelLeave(req.params.id, req.user.employee.id);
  return sendSuccess(res, leave, 'Leave cancelled');
});

module.exports = router;
