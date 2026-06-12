const prisma = require('../config/database');
const { getPagination, buildPaginationMeta } = require('../utils/response');
const notificationService = require('./notificationService');

class LeaveService {
  calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  async applyLeave(employeeId, data) {
    const { leaveType, startDate, endDate, reason, isHalfDay } = data;
    const totalDays = isHalfDay ? 0.5 : this.calculateDays(startDate, endDate);

    // Check leave balance
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveType_year: {
          employeeId,
          leaveType,
          year: new Date(startDate).getFullYear(),
        },
      },
    });

    if (!balance || (balance.totalDays - balance.usedDays - balance.pendingDays) < totalDays) {
      throw new Error('Insufficient leave balance');
    }

    // Check overlapping leaves
    const overlap = await prisma.leaveApplication.findFirst({
      where: {
        employeeId,
        status: { notIn: ['MANAGER_REJECTED', 'HR_REJECTED', 'CANCELLED'] },
        OR: [
          { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } },
        ],
      },
    });

    if (overlap) throw new Error('You have overlapping leave applications');

    // Get manager
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { managerId: true, firstName: true, lastName: true, manager: { select: { userId: true } } },
    });

    const leave = await prisma.$transaction(async (tx) => {
      const newLeave = await tx.leaveApplication.create({
        data: {
          employeeId,
          leaveType,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          totalDays,
          reason,
          isHalfDay: !!isHalfDay,
          managerId: employee.managerId,
        },
        include: { employee: { select: { firstName: true, lastName: true } } },
      });

      await tx.leaveBalance.update({
        where: { employeeId_leaveType_year: { employeeId, leaveType, year: new Date(startDate).getFullYear() } },
        data: { pendingDays: { increment: totalDays } },
      });

      return newLeave;
    });

    // Notify manager
    if (employee.manager?.userId) {
      await notificationService.create({
        userId: employee.manager.userId,
        type: 'LEAVE_APPLIED',
        title: 'New Leave Application',
        message: `${employee.firstName} ${employee.lastName} has applied for ${leaveType} leave`,
        data: { leaveId: leave.id },
      });
    }

    return leave;
  }

  async getLeaves({ page, limit, employeeId, status, leaveType, managerId, hrView }) {
    const { skip, take } = getPagination(page, limit);

    const where = {
      ...(employeeId && { employeeId }),
      ...(status && { status }),
      ...(leaveType && { leaveType }),
      ...(managerId && { managerId }),
    };

    const [leaves, total] = await Promise.all([
      prisma.leaveApplication.findMany({
        where,
        skip,
        take,
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, profileImage: true, department: { select: { name: true } } } },
          manager: { select: { id: true, firstName: true, lastName: true } },
          hrProcessor: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leaveApplication.count({ where }),
    ]);

    return { leaves, pagination: buildPaginationMeta(total, page, limit) };
  }

  async managerAction(leaveId, managerId, action, comment) {
    const leave = await prisma.leaveApplication.findUnique({
      where: { id: leaveId },
      include: { employee: { select: { firstName: true, lastName: true, userId: true } } },
    });

    if (!leave) throw new Error('Leave application not found');
    if (leave.status !== 'PENDING') throw new Error('Leave is no longer pending');
    if (leave.managerId !== managerId) throw new Error('Not authorized to approve this leave');

    const newStatus = action === 'approve' ? 'MANAGER_APPROVED' : 'MANAGER_REJECTED';

    const updated = await prisma.$transaction(async (tx) => {
      const updatedLeave = await tx.leaveApplication.update({
        where: { id: leaveId },
        data: {
          status: newStatus,
          managerComment: comment,
          managerActionAt: new Date(),
        },
      });

      if (action === 'reject') {
        await tx.leaveBalance.updateMany({
          where: {
            employeeId: leave.employeeId,
            leaveType: leave.leaveType,
            year: leave.startDate.getFullYear(),
          },
          data: { pendingDays: { decrement: leave.totalDays } },
        });
      }

      return updatedLeave;
    });

    // Notify employee
    await notificationService.create({
      userId: leave.employee.userId,
      type: action === 'approve' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      title: `Leave ${action === 'approve' ? 'Approved' : 'Rejected'} by Manager`,
      message: `Your ${leave.leaveType} leave has been ${action === 'approve' ? 'approved' : 'rejected'} by your manager`,
      data: { leaveId },
    });

    return updated;
  }

  async hrAction(leaveId, hrEmployeeId, action, comment) {
    const leave = await prisma.leaveApplication.findUnique({
      where: { id: leaveId },
      include: { employee: { select: { firstName: true, lastName: true, userId: true } } },
    });

    if (!leave) throw new Error('Leave application not found');
    if (leave.status !== 'MANAGER_APPROVED') throw new Error('Leave must be manager approved first');

    const newStatus = action === 'approve' ? 'HR_APPROVED' : 'HR_REJECTED';

    const updated = await prisma.$transaction(async (tx) => {
      const updatedLeave = await tx.leaveApplication.update({
        where: { id: leaveId },
        data: { status: newStatus, hrId: hrEmployeeId, hrComment: comment, hrActionAt: new Date() },
      });

      const year = leave.startDate.getFullYear();
      if (action === 'approve') {
        await tx.leaveBalance.updateMany({
          where: { employeeId: leave.employeeId, leaveType: leave.leaveType, year },
          data: { usedDays: { increment: leave.totalDays }, pendingDays: { decrement: leave.totalDays } },
        });
      } else {
        await tx.leaveBalance.updateMany({
          where: { employeeId: leave.employeeId, leaveType: leave.leaveType, year },
          data: { pendingDays: { decrement: leave.totalDays } },
        });
      }

      return updatedLeave;
    });

    await notificationService.create({
      userId: leave.employee.userId,
      type: action === 'approve' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
      title: `Leave ${action === 'approve' ? 'Approved' : 'Rejected'} by HR`,
      message: `Your ${leave.leaveType} leave has been ${action === 'approve' ? 'finally approved' : 'rejected'} by HR`,
      data: { leaveId },
    });

    return updated;
  }

  async cancelLeave(leaveId, employeeId) {
    const leave = await prisma.leaveApplication.findUnique({ where: { id: leaveId } });
    if (!leave || leave.employeeId !== employeeId) throw new Error('Leave not found');
    if (!['PENDING', 'MANAGER_APPROVED'].includes(leave.status)) throw new Error('Cannot cancel this leave');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.leaveApplication.update({
        where: { id: leaveId },
        data: { status: 'CANCELLED' },
      });

      await tx.leaveBalance.updateMany({
        where: { employeeId, leaveType: leave.leaveType, year: leave.startDate.getFullYear() },
        data: { pendingDays: { decrement: leave.totalDays } },
      });

      return updated;
    });
  }

  async getLeaveBalance(employeeId, year) {
    const currentYear = year || new Date().getFullYear();
    return prisma.leaveBalance.findMany({
      where: { employeeId, year: currentYear },
    });
  }
}

module.exports = new LeaveService();
