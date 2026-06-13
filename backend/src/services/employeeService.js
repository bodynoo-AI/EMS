const prisma = require('../config/database');
const { getPagination, buildPaginationMeta } = require('../utils/response');

class EmployeeService {
  async generateEmployeeId() {
    const count = await prisma.employee.count();
    return `EMP${String(count + 1).padStart(4, '0')}`;
  }

  async createEmployee(data, userId) {
    const employeeId = await this.generateEmployeeId();
    
    const employee = await prisma.employee.create({
      data: {
        ...data,
        employeeId,
        userId,
        skills: data.skills ? {
          create: data.skills.map(s => ({
            skillId: s.skillId,
            level: s.level,
            yearsExp: s.yearsExp,
          })),
        } : undefined,
      },
      include: {
        department: true,
        skills: { include: { skill: true } },
        user: { select: { email: true, role: true, isEmailVerified: true } },
      },
    });

    // Create leave balances for new employee
    const leaveTypes = ['ANNUAL', 'SICK', 'CASUAL'];
    const year = new Date().getFullYear();
    await prisma.leaveBalance.createMany({
      data: leaveTypes.map(leaveType => ({
        employeeId: employee.id,
        leaveType,
        year,
        totalDays: leaveType === 'ANNUAL' ? 21 : leaveType === 'SICK' ? 14 : 10,
      })),
    });

    return employee;
  }

  async getEmployees({ page, limit, search, departmentId, role, isActive }) {
    const { skip, take } = getPagination(page, limit);
    
    const where = {
      isActive: isActive !== undefined ? isActive === 'true' : true,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { employeeId: { contains: search, mode: 'insensitive' } },
          { designation: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(departmentId && { departmentId }),
      ...(role && { user: { role } }),
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take,
        include: {
          department: { select: { id: true, name: true, code: true } },
          manager: { select: { id: true, firstName: true, lastName: true } },
          skills: { include: { skill: { select: { id: true, name: true, category: true } } } },
          user: { select: { email: true, role: true, lastLogin: true, isEmailVerified: true } },
          _count: { select: { leaveApplications: true, allocatedAssets: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return { employees, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getEmployeeById(id) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        manager: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
        subordinates: { select: { id: true, firstName: true, lastName: true, designation: true, profileImage: true } },
        skills: { include: { skill: true } },
        user: { select: { email: true, role: true, lastLogin: true, isEmailVerified: true, createdAt: true } },
        leaveApplications: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { manager: { select: { firstName: true, lastName: true } } },
        },
        leaveBalances: { where: { year: new Date().getFullYear() } },
        allocatedAssets: {
          where: { isActive: true },
          include: { asset: { select: { id: true, name: true, assetType: true, assetTag: true } } },
        },
      },
    });

    if (!employee) throw new Error('Employee not found');
    return employee;
  }

  async updateEmployee(id, data) {
    const { skills, ...employeeData } = data;
  
    // Convert empty strings to null
    Object.keys(employeeData).forEach(key => {
      if (employeeData[key] === '') {
        employeeData[key] = null;
      }
    });
  
    // Convert dates
    if (employeeData.dateOfBirth) {
      employeeData.dateOfBirth = new Date(employeeData.dateOfBirth);
    }
  
    if (employeeData.joiningDate) {
      employeeData.joiningDate = new Date(employeeData.joiningDate);
    }
  
    // Convert salary
    if (employeeData.salary) {
      employeeData.salary = parseFloat(employeeData.salary);
    } else {
      employeeData.salary = null;
    }
  
    const employee = await prisma.$transaction(async (tx) => {
      await tx.employee.update({
        where: { id },
        data: employeeData,
      });
  
      if (skills) {
        await tx.employeeSkill.deleteMany({
          where: { employeeId: id }
        });
  
        await tx.employeeSkill.createMany({
          data: skills.map(s => ({
            employeeId: id,
            skillId: s.skillId,
            level: s.level,
            yearsExp: s.yearsExp,
          })),
        });
      }
    });
  
    return this.getEmployeeById(id);
  }

  async deleteEmployee(id) {
    await prisma.employee.update({ where: { id }, data: { isActive: false } });
    await prisma.user.update({ where: { id: (await prisma.employee.findUnique({ where: { id }, select: { userId: true } })).userId }, data: { isActive: false } });
    return true;
  }

  async updateProfileImage(id, imageUrl) {
    return prisma.employee.update({ where: { id }, data: { profileImage: imageUrl } });
  }

  async updateDocuments(id, type, url) {
    const employee = await prisma.employee.findUnique({ where: { id }, select: { documents: true } });
    const docs = (employee.documents || {});
    docs[type] = url;
    return prisma.employee.update({ where: { id }, data: { documents: docs } });
  }

  async getEmployeeStats() {
    const [total, active, byDept, byRole, recentJoins] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { isActive: true } }),
      prisma.employee.groupBy({
        by: ['departmentId'],
        _count: true,
        where: { isActive: true },
      }),
      prisma.user.groupBy({ by: ['role'], _count: true }),
      prisma.employee.count({
        where: { joiningDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    return { total, active, inactive: total - active, byDept, byRole, recentJoins };
  }
}

module.exports = new EmployeeService();
