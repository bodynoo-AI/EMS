const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const prisma = require('../config/database');
const { sendPaginated, getPagination, buildPaginationMeta } = require('../utils/response');

router.use(protect, authorize('ADMIN', 'HR'));

router.get('/', async (req, res) => {
  const { page = 1, limit = 20, tableName, action, userId } = req.query;
  const { skip, take } = getPagination(page, limit);

  const where = {
    ...(tableName && { tableName }),
    ...(action && { action }),
    ...(userId && { userId }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where, skip, take,
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return sendPaginated(res, logs, buildPaginationMeta(total, page, limit));
});

module.exports = router;
