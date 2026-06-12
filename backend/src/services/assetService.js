const prisma = require('../config/database');
const { getPagination, buildPaginationMeta } = require('../utils/response');
const notificationService = require('./notificationService');

class AssetService {
  async generateAssetTag(type) {
    const count = await prisma.asset.count({ where: { assetType: type } });
    const prefix = type.substring(0, 3).toUpperCase();
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }

  async createAsset(data) {
    const assetTag = await this.generateAssetTag(data.assetType);
    return prisma.asset.create({
      data: { ...data, assetTag },
    });
  }

  async getAssets({ page, limit, search, assetType, status }) {
    const { skip, take } = getPagination(page, limit);

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { assetTag: { contains: search, mode: 'insensitive' } },
          { serialNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(assetType && { assetType }),
      ...(status && { status }),
    };

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take,
        include: {
          allocations: {
            where: { isActive: true },
            include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } },
          },
          _count: { select: { allocations: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.asset.count({ where }),
    ]);

    return { assets, pagination: buildPaginationMeta(total, page, limit) };
  }

  async getAssetById(id) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        allocations: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, employeeId: true, profileImage: true } },
          },
          orderBy: { allocatedAt: 'desc' },
        },
      },
    });
    if (!asset) throw new Error('Asset not found');
    return asset;
  }

  async updateAsset(id, data) {
    return prisma.asset.update({ where: { id }, data });
  }

  async allocateAsset(assetId, employeeId, allocatedBy, notes) {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) throw new Error('Asset not found');
    if (asset.status !== 'AVAILABLE') throw new Error('Asset is not available for allocation');

    const result = await prisma.$transaction(async (tx) => {
      const allocation = await tx.assetAllocation.create({
        data: { assetId, employeeId, allocatedBy, notes },
        include: {
          asset: true,
          employee: { select: { firstName: true, lastName: true, user: { select: { id: true } } } },
        },
      });

      await tx.asset.update({ where: { id: assetId }, data: { status: 'ALLOCATED' } });

      return allocation;
    });

    // Notify employee
    if (result.employee.user?.id) {
      await notificationService.create({
        userId: result.employee.user.id,
        type: 'ASSET_ASSIGNED',
        title: 'Asset Assigned to You',
        message: `${result.asset.name} (${result.asset.assetTag}) has been assigned to you`,
        data: { assetId, allocationId: result.id },
      });
    }

    return result;
  }

  async returnAsset(allocationId, returnedTo, condition, notes) {
    const allocation = await prisma.assetAllocation.findUnique({
      where: { id: allocationId },
      include: { asset: true },
    });

    if (!allocation || !allocation.isActive) throw new Error('Allocation not found or already returned');

    return prisma.$transaction(async (tx) => {
      const updated = await tx.assetAllocation.update({
        where: { id: allocationId },
        data: { returnedAt: new Date(), returnedTo, condition, notes, isActive: false },
      });

      await tx.asset.update({ where: { id: allocation.assetId }, data: { status: 'AVAILABLE' } });

      return updated;
    });
  }

  async getAssetStats() {
    const [total, available, allocated, maintenance, byType] = await Promise.all([
      prisma.asset.count({ where: { isActive: true } }),
      prisma.asset.count({ where: { status: 'AVAILABLE', isActive: true } }),
      prisma.asset.count({ where: { status: 'ALLOCATED', isActive: true } }),
      prisma.asset.count({ where: { status: 'UNDER_MAINTENANCE', isActive: true } }),
      prisma.asset.groupBy({ by: ['assetType'], _count: true, where: { isActive: true } }),
    ]);

    return { total, available, allocated, maintenance, byType };
  }
}

module.exports = new AssetService();
