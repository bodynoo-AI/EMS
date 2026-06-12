const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../config/database');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access token required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id, isActive: true },
      include: { employee: { select: { id: true, firstName: true, lastName: true, departmentId: true, managerId: true } } },
    });

    if (!user) {
      return sendError(res, 'User not found or deactivated', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Access token expired', 401);
    }
    return sendError(res, 'Invalid token', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, `Role '${req.user.role}' is not authorized for this action`, 403);
    }
    next();
  };
};

const requireEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return sendError(res, 'Please verify your email first', 403);
  }
  next();
};

module.exports = { protect, authorize, requireEmailVerified };
