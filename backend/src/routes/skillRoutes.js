const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const prisma = require('../config/database');
const { sendSuccess } = require('../utils/response');

router.use(protect);

router.get('/', async (req, res) => {
  const { category } = req.query;
  const skills = await prisma.skill.findMany({
    where: { isActive: true, ...(category && { category }) },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
  return sendSuccess(res, skills);
});

router.post('/', authorize('ADMIN', 'HR'), async (req, res) => {
  const skill = await prisma.skill.create({ data: req.body });
  return sendSuccess(res, skill, 'Skill created', 201);
});

router.put('/:id', authorize('ADMIN', 'HR'), async (req, res) => {
  const skill = await prisma.skill.update({ where: { id: req.params.id }, data: req.body });
  return sendSuccess(res, skill, 'Skill updated');
});

router.delete('/:id', authorize('ADMIN'), async (req, res) => {
  await prisma.skill.update({ where: { id: req.params.id }, data: { isActive: false } });
  return sendSuccess(res, null, 'Skill deleted');
});

module.exports = router;
