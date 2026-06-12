const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const reportService = require('../services/reportService');
const { sendSuccess } = require('../utils/response');

router.use(protect, authorize('ADMIN', 'HR'));

router.get('/employees', async (req, res) => {
  const { format, departmentId, isActive } = req.query;
  const data = await reportService.getEmployeeReport({ departmentId, isActive, format });

  if (format === 'excel') {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.xlsx');
    return res.send(data);
  }
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
    return res.send(data);
  }
  return sendSuccess(res, data);
});

router.get('/leaves', async (req, res) => {
  const { format, year, status, departmentId } = req.query;
  const data = await reportService.getLeaveReport({ year, status, departmentId, format });

  if (format === 'excel') {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=leaves.xlsx');
    return res.send(data);
  }
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leaves.csv');
    return res.send(data);
  }
  return sendSuccess(res, data);
});

router.get('/assets', async (req, res) => {
  const { format, assetType, status } = req.query;
  const data = await reportService.getAssetReport({ assetType, status, format });

  if (format === 'excel') {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=assets.xlsx');
    return res.send(data);
  }
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=assets.csv');
    return res.send(data);
  }
  return sendSuccess(res, data);
});

module.exports = router;
