const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/database');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { sendEmail, emailTemplates } = require('../config/email');

class AuthService {
  async register({ email, password, role = 'EMPLOYEE' }) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(password, 12);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

 const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    role,
    emailVerifyToken,
  },
});

// Create Employee profile automatically
if (role === 'EMPLOYEE') {
  const employeeCount = await prisma.employee.count();

  await prisma.employee.create({
    data: {
      employeeId: `EMP${String(employeeCount + 1).padStart(4, '0')}`,
      userId: user.id,
      firstName: email.split('@')[0],
      lastName: '',
      email: email,
      designation: 'Employee',
      joiningDate: new Date(),
      isActive: true,
    },
  });
}
    await prisma.leaveBalance.createMany({
  data: [
    {
      employeeId: employee.id,
      leaveType: 'ANNUAL',
      year: new Date().getFullYear(),
      totalDays: 20
    },
    {
      employeeId: employee.id,
      leaveType: 'SICK',
      year: new Date().getFullYear(),
      totalDays: 10
    },
    {
      employeeId: employee.id,
      leaveType: 'CASUAL',
      year: new Date().getFullYear(),
      totalDays: 12
    }
  ]
});
    const { accessToken, refreshToken } = generateTokenPair({ id: user.id, email: user.email, role: user.role });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    // Send verification email
    try {
      const template = emailTemplates.verifyEmail(email, emailVerifyToken);
      await sendEmail({ to: email, ...template });
    } catch (err) {
      console.error('Email send error:', err);
    }

    const { password: _, refreshToken: __, emailVerifyToken: ___, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email, isActive: true },
      include: { employee: { select: { id: true, firstName: true, lastName: true, profileImage: true, departmentId: true } } },
    });

    if (!user) throw new Error('Invalid credentials');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid credentials');

    const { accessToken, refreshToken } = generateTokenPair({ id: user.id, email: user.email, role: user.role });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken, lastLogin: new Date() } });

    const { password: _, refreshToken: __, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }

  async refreshTokens(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findFirst({ where: { id: decoded.id, refreshToken } });
    if (!user) throw new Error('Invalid refresh token');

    const tokens = generateTokenPair({ id: user.id, email: user.email, role: user.role });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

    return tokens;
  }

  async verifyEmail(token) {
    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    if (!user) throw new Error('Invalid or expired verification token');

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifyToken: null },
    });

    return true;
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('No account found with this email');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken, resetPasswordExpiry: resetExpiry },
    });

    const template = emailTemplates.resetPassword(email, resetToken);
    await sendEmail({ to: email, ...template });

    return true;
  }

  async resetPassword(token, newPassword) {
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token, resetPasswordExpiry: { gt: new Date() } },
    });
    if (!user) throw new Error('Invalid or expired reset token');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpiry: null },
    });

    return true;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new Error('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

    return true;
  }

  async logout(userId) {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    return true;
  }
}

module.exports = new AuthService();
