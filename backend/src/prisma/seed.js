const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      password: adminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({ where: { code: 'ENG' }, update: {}, create: { name: 'Engineering', code: 'ENG', description: 'Software Engineering Department' } }),
    prisma.department.upsert({ where: { code: 'HR' }, update: {}, create: { name: 'Human Resources', code: 'HR', description: 'HR Department' } }),
    prisma.department.upsert({ where: { code: 'FIN' }, update: {}, create: { name: 'Finance', code: 'FIN', description: 'Finance Department' } }),
    prisma.department.upsert({ where: { code: 'MKT' }, update: {}, create: { name: 'Marketing', code: 'MKT', description: 'Marketing Department' } }),
    prisma.department.upsert({ where: { code: 'OPS' }, update: {}, create: { name: 'Operations', code: 'OPS', description: 'Operations Department' } }),
  ]);

  // Create skills
  const skillsData = [
    { name: 'JavaScript', category: 'Frontend' }, { name: 'React.js', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' }, { name: 'PostgreSQL', category: 'Database' },
    { name: 'Python', category: 'Backend' }, { name: 'AWS', category: 'Cloud' },
    { name: 'Docker', category: 'DevOps' }, { name: 'Project Management', category: 'Management' },
    { name: 'HR Management', category: 'HR' }, { name: 'Financial Analysis', category: 'Finance' },
  ];

  for (const s of skillsData) {
    await prisma.skill.upsert({ where: { name: s.name }, update: {}, create: s });
  }

  // Create admin employee profile
  await prisma.employee.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      employeeId: 'EMP0001',
      userId: admin.id,
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@company.com',
      departmentId: departments[0].id,
      designation: 'System Administrator',
      joiningDate: new Date('2020-01-01'),
    },
  });

  // Create sample HR user
  const hrPassword = await bcrypt.hash('Hr@123456', 12);
  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: { email: 'hr@company.com', password: hrPassword, role: 'HR', isEmailVerified: true },
  });

  await prisma.employee.upsert({
    where: { userId: hrUser.id },
    update: {},
    create: {
      employeeId: 'EMP0002',
      userId: hrUser.id,
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'hr@company.com',
      departmentId: departments[1].id,
      designation: 'HR Manager',
      joiningDate: new Date('2021-03-15'),
    },
  });

  // Create some assets
  const assetsData = [
    { name: 'MacBook Pro 16"', assetType: 'LAPTOP', brand: 'Apple', model: 'MBP2023', serialNumber: 'MBP001', purchaseCost: 185000 },
    { name: 'Dell Monitor 27"', assetType: 'MONITOR', brand: 'Dell', model: 'P2722H', serialNumber: 'DEL001', purchaseCost: 25000 },
    { name: 'HP Laptop', assetType: 'LAPTOP', brand: 'HP', model: 'EliteBook840', serialNumber: 'HP001', purchaseCost: 75000 },
    { name: 'Employee ID Card', assetType: 'ID_CARD', brand: 'Company', model: 'RFID-2024', serialNumber: null, purchaseCost: 500 },
  ];

  for (let i = 0; i < assetsData.length; i++) {
    const a = assetsData[i];
    const prefix = a.assetType.substring(0, 3);
    await prisma.asset.upsert({
      where: { assetTag: `${prefix}-${String(i + 1).padStart(4, '0')}` },
      update: {},
      create: { ...a, assetTag: `${prefix}-${String(i + 1).padStart(4, '0')}`, purchaseDate: new Date('2023-01-01') },
    });
  }

  console.log('✅ Seed completed!');
  console.log('📧 Admin: admin@company.com | Password: Admin@123');
  console.log('📧 HR: hr@company.com | Password: Hr@123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
