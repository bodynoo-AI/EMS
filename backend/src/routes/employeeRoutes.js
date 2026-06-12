const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { profileUpload, documentUpload, resumeUpload } = require('../config/cloudinary');
const auditLog = require('../middleware/auditMiddleware');

router.use(protect);

router.get('/me', employeeController.getMyProfile);
router.put('/me', employeeController.updateMyProfile);
router.get('/stats', authorize('ADMIN', 'HR'), employeeController.getStats);

router.get('/', authorize('ADMIN', 'HR', 'MANAGER'), employeeController.getEmployees);
router.post('/', authorize('ADMIN', 'HR'), auditLog('employees', 'CREATE'), employeeController.createEmployee);

router.get('/:id', employeeController.getEmployee);
router.put('/:id', authorize('ADMIN', 'HR'), auditLog('employees', 'UPDATE'), employeeController.updateEmployee);
router.delete('/:id', authorize('ADMIN'), auditLog('employees', 'DELETE'), employeeController.deleteEmployee);

router.post('/:id/profile-image', profileUpload.single('image'), employeeController.uploadProfileImage);
router.post('/:id/resume', resumeUpload.single('resume'), employeeController.uploadDocument);
router.post('/:id/documents', documentUpload.single('document'), employeeController.uploadDocument);

module.exports = router;
