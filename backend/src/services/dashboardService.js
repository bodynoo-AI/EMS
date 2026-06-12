const prisma = require('../config/database');

class DashboardService {
  async getAdminDashboard() {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalEmployees,
      activeEmployees,
      totalDepts,
      pendingLeaves,
      approvedLeavesThisMonth,
      totalAssets,
      allocatedAssets,
      recentJoins,
      deptStats,
      assetsByType,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({
        where: { isActive: true },
      }),
      prisma.department.count({
        where: { isActive: true },
      }),
      prisma.leaveApplication.count({
        where: { status: 'PENDING' },
      }),
      prisma.leaveApplication.count({
        where: {
          status: 'HR_APPROVED',
          startDate: {
            gte: thisMonth,
          },
        },
      }),
      prisma.asset.count({
        where: { isActive: true },
      }),
      prisma.asset.count({
        where: {
          status: 'ALLOCATED',
          isActive: true,
        },
      }),
      prisma.employee.findMany({
        where: {
          joiningDate: {
            gte: new Date(
              now.getTime() - 30 * 24 * 60 * 60 * 1000
            ),
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          designation: true,
          profileImage: true,
          joiningDate: true,
        },
        take: 5,
        orderBy: {
          joiningDate: 'desc',
        },
      }),
      prisma.department.findMany({
        where: {
          isActive: true,
        },
        include: {
          _count: {
            select: {
              employees: {
                where: {
                  isActive: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.asset.groupBy({
        by: ['assetType'],
        _count: true,
        where: {
          isActive: true,
        },
      }),
    ]);

    return {
      stats: {
        totalEmployees,
        activeEmployees,
        totalDepts,
        pendingLeaves,
        approvedLeavesThisMonth,
        totalAssets,
        allocatedAssets,
        availableAssets: totalAssets - allocatedAssets,
      },

      recentJoins,

      leaveTrend: [],

      deptStats: deptStats.map((d) => ({
        name: d.name,
        count: d._count.employees,
        code: d.code,
      })),

      assetsByType: assetsByType.map((a) => ({
        type: a.assetType,
        count: a._count,
      })),
    };
  }

  async getEmployeeDashboard(employeeId) {
    const now = new Date();
    const year = now.getFullYear();

    const [
      employee,
      leaveBalances,
      pendingLeaves,
      recentLeaves,
      allocatedAssets,
    ] = await Promise.all([
      prisma.employee.findUnique({
        where: { id: employeeId },
        include: {
          department: {
            select: {
              name: true,
            },
          },
          manager: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      }),

      prisma.leaveBalance.findMany({
        where: {
          employeeId,
          year,
        },
      }),

      prisma.leaveApplication.count({
        where: {
          employeeId,
          status: 'PENDING',
        },
      }),

      prisma.leaveApplication.findMany({
        where: {
          employeeId,
        },
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          leaveType: true,
          startDate: true,
          endDate: true,
          status: true,
          totalDays: true,
        },
      }),

      prisma.assetAllocation.findMany({
        where: {
          employeeId,
          isActive: true,
        },
        include: {
          asset: {
            select: {
              name: true,
              assetType: true,
              assetTag: true,
            },
          },
        },
      }),
    ]);

    const leavesTaken = leaveBalances.reduce(
      (sum, b) => sum + b.usedDays,
      0
    );

    const leavesAvailable = leaveBalances.reduce(
      (sum, b) =>
        sum + (b.totalDays - b.usedDays - b.pendingDays),
      0
    );

    return {
      employee,
      leaveBalances,

      stats: {
        pendingLeaves,
        leavesTaken,
        leavesAvailable,
        allocatedAssetsCount: allocatedAssets.length,
      },

      recentLeaves,
      allocatedAssets,
    };
  }

  async getManagerDashboard(managerId) {
    const [
      teamSize,
      pendingApprovals,
      teamLeaves,
    ] = await Promise.all([
      prisma.employee.count({
        where: {
          managerId,
          isActive: true,
        },
      }),

      prisma.leaveApplication.count({
        where: {
          managerId,
          status: 'PENDING',
        },
      }),

      prisma.leaveApplication.findMany({
        where: {
          managerId,
          status: 'PENDING',
        },
        take: 10,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    return {
      stats: {
        teamSize,
        pendingApprovals,
      },
      teamLeaves,
    };
  }
}

module.exports = new DashboardService();