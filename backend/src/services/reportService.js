const prisma = require('../config/database');
const ExcelJS = require('exceljs');

class ReportService {
  async getEmployeeReport({ departmentId, isActive, format }) {
    const employees = await prisma.employee.findMany({
      where: {
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(departmentId && { departmentId }),
      },
      include: {
        department: { select: { name: true } },
        user: { select: { email: true, role: true } },
        skills: { include: { skill: { select: { name: true } } } },
      },
      orderBy: [{ department: { name: 'asc' } }, { firstName: 'asc' }],
    });

    if (format === 'csv') return this.toCSV(employees, 'employee');
    if (format === 'excel') return this.toExcel(employees, 'employee');
    return employees;
  }

  async getLeaveReport({ year, status, departmentId, format }) {
    const currentYear = year || new Date().getFullYear();

    const leaves = await prisma.leaveApplication.findMany({
      where: {
        ...(status && { status }),
        startDate: { gte: new Date(`${currentYear}-01-01`), lte: new Date(`${currentYear}-12-31`) },
        ...(departmentId && { employee: { departmentId } }),
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    if (format === 'csv') return this.toCSV(leaves, 'leave');
    if (format === 'excel') return this.toExcel(leaves, 'leave');
    return leaves;
  }

  async getAssetReport({ assetType, status, format }) {
    const assets = await prisma.asset.findMany({
      where: {
        isActive: true,
        ...(assetType && { assetType }),
        ...(status && { status }),
      },
      include: {
        allocations: {
          where: { isActive: true },
          include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
        },
      },
      orderBy: { assetType: 'asc' },
    });

    if (format === 'csv') return this.toCSV(assets, 'asset');
    if (format === 'excel') return this.toExcel(assets, 'asset');
    return assets;
  }

  toCSV(data, type) {
    if (!data.length) return '';

    if (type === 'employee') {
      const rows = data.map(e => [
        e.employeeId, e.firstName, e.lastName, e.email, e.phone,
        e.department?.name || 'N/A', e.designation, e.joiningDate?.toLocaleDateString(),
        e.user?.role, e.isActive ? 'Active' : 'Inactive',
      ]);
      const headers = ['Employee ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Designation', 'Joining Date', 'Role', 'Status'];
      return [headers, ...rows].map(r => r.join(',')).join('\n');
    }

    if (type === 'leave') {
      const rows = data.map(l => [
        l.employee?.employeeId, `${l.employee?.firstName} ${l.employee?.lastName}`,
        l.employee?.department?.name, l.leaveType, l.startDate?.toLocaleDateString(),
        l.endDate?.toLocaleDateString(), l.totalDays, l.status,
      ]);
      const headers = ['Employee ID', 'Employee Name', 'Department', 'Leave Type', 'From', 'To', 'Days', 'Status'];
      return [headers, ...rows].map(r => r.join(',')).join('\n');
    }

    if (type === 'asset') {
      const rows = data.map(a => [
        a.assetTag, a.name, a.assetType, a.brand, a.model,
        a.serialNumber, a.status,
        a.allocations[0] ? `${a.allocations[0].employee.firstName} ${a.allocations[0].employee.lastName}` : 'N/A',
      ]);
      const headers = ['Asset Tag', 'Name', 'Type', 'Brand', 'Model', 'Serial Number', 'Status', 'Assigned To'];
      return [headers, ...rows].map(r => r.join(',')).join('\n');
    }
  }

  async toExcel(data, type) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(type.charAt(0).toUpperCase() + type.slice(1) + ' Report');

    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E40AF' } },
      alignment: { horizontal: 'center' },
    };

    if (type === 'employee') {
      sheet.columns = [
        { header: 'Employee ID', key: 'employeeId', width: 15 },
        { header: 'First Name', key: 'firstName', width: 15 },
        { header: 'Last Name', key: 'lastName', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Department', key: 'dept', width: 20 },
        { header: 'Designation', key: 'designation', width: 20 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Status', key: 'status', width: 10 },
      ];

      data.forEach(e => sheet.addRow({
        employeeId: e.employeeId,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        dept: e.department?.name || 'N/A',
        designation: e.designation,
        role: e.user?.role,
        status: e.isActive ? 'Active' : 'Inactive',
      }));
    }

    // Style header row
    sheet.getRow(1).eachCell(cell => { Object.assign(cell, headerStyle); });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

module.exports = new ReportService();
