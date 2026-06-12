const employeeService = require('../services/employeeService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { validationResult } = require('express-validator');

class EmployeeController {
  async createEmployee(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation failed', 400, errors.array());

    const employee = await employeeService.createEmployee(req.body, req.body.userId);
    req.auditData = { recordId: employee.id, newValues: req.body };
    return sendSuccess(res, employee, 'Employee created successfully', 201);
  }

  async getEmployees(req, res) {
    const { page = 1, limit = 10, search, departmentId, role, isActive } = req.query;
    const result = await employeeService.getEmployees({ page, limit, search, departmentId, role, isActive });
    return sendPaginated(res, result.employees, result.pagination);
  }

  async getEmployee(req, res) {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return sendSuccess(res, employee);
  }

  async updateEmployee(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendError(res, 'Validation failed', 400, errors.array());

    const old = await employeeService.getEmployeeById(req.params.id);
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    req.auditData = { recordId: req.params.id, oldValues: old, newValues: req.body };
    return sendSuccess(res, employee, 'Employee updated successfully');
  }

  async deleteEmployee(req, res) {
    await employeeService.deleteEmployee(req.params.id);
    req.auditData = { recordId: req.params.id };
    return sendSuccess(res, null, 'Employee deactivated successfully');
  }

  async uploadProfileImage(req, res) {
    if (!req.file) return sendError(res, 'No file uploaded', 400);
    const employee = await employeeService.updateProfileImage(req.params.id, req.file.path);
    return sendSuccess(res, { profileImage: req.file.path }, 'Profile image updated');
  }

  async uploadDocument(req, res) {
    if (!req.file) return sendError(res, 'No file uploaded', 400);
    const { type } = req.body;
    await employeeService.updateDocuments(req.params.id, type || 'document', req.file.path);
    return sendSuccess(res, { url: req.file.path }, 'Document uploaded');
  }

  async getStats(req, res) {
    const stats = await employeeService.getEmployeeStats();
    return sendSuccess(res, stats);
  }

  async getMyProfile(req, res) {
    if (!req.user.employee) return sendError(res, 'Employee profile not found', 404);
    const employee = await employeeService.getEmployeeById(req.user.employee.id);
    return sendSuccess(res, employee);
  }

  async updateMyProfile(req, res) {
    if (!req.user.employee) return sendError(res, 'Employee profile not found', 404);
    // Employees can only update specific fields
    const { phone, address, city, state, country, pincode, emergencyContact, bankDetails } = req.body;
    const employee = await employeeService.updateEmployee(req.user.employee.id, {
      phone, address, city, state, country, pincode, emergencyContact, bankDetails,
    });
    return sendSuccess(res, employee, 'Profile updated');
  }
}

module.exports = new EmployeeController();
