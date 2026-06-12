const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const assetService = require('../services/assetService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

router.use(protect);

router.get('/stats', authorize('ADMIN', 'HR'), async (req, res) => {
  const stats = await assetService.getAssetStats();
  return sendSuccess(res, stats);
});

router.get('/', async (req, res) => {
  const { page, limit, search, assetType, status } = req.query;
  const result = await assetService.getAssets({ page, limit, search, assetType, status });
  return sendPaginated(res, result.assets, result.pagination);
});

router.post('/', authorize('ADMIN', 'HR'), async (req, res) => {
  const asset = await assetService.createAsset(req.body);
  return sendSuccess(res, asset, 'Asset created', 201);
});

router.get('/:id', async (req, res) => {
  const asset = await assetService.getAssetById(req.params.id);
  return sendSuccess(res, asset);
});

router.put('/:id', authorize('ADMIN', 'HR'), async (req, res) => {
  const asset = await assetService.updateAsset(req.params.id, req.body);
  return sendSuccess(res, asset, 'Asset updated');
});

router.post('/:id/allocate', authorize('ADMIN', 'HR'), async (req, res) => {
  const { employeeId, notes } = req.body;
  const allocation = await assetService.allocateAsset(req.params.id, employeeId, req.user.employee?.id, notes);
  return sendSuccess(res, allocation, 'Asset allocated successfully');
});

router.post('/allocations/:allocationId/return', authorize('ADMIN', 'HR'), async (req, res) => {
  const { condition, notes } = req.body;
  const allocation = await assetService.returnAsset(req.params.allocationId, req.user.employee?.id, condition, notes);
  return sendSuccess(res, allocation, 'Asset returned successfully');
});

module.exports = router;
