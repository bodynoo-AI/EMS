// departmentRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const prisma = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

router.use(protect);

router.get('/', async (req, res) => {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    include: {
      manager: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { employees: { where: { isActive: true } } } },
    },
    orderBy: { name: 'asc' },
  });
  return sendSuccess(res, departments);
});

router.post('/', authorize('ADMIN', 'HR'), async (req, res) => {
  const dept = await prisma.department.create({ data: req.body });
  return sendSuccess(res, dept, 'Department created', 201);
});

router.put('/:id', authorize('ADMIN', 'HR'), async (req, res) => {
  const dept = await prisma.department.update({ where: { id: req.params.id }, data: req.body });
  return sendSuccess(res, dept, 'Department updated');
});

router.delete('/:id', authorize('ADMIN'), async (req, res) => {
  await prisma.department.update({ where: { id: req.params.id }, data: { isActive: false } });
  return sendSuccess(res, null, 'Department deleted');
});

module.exports = router;
