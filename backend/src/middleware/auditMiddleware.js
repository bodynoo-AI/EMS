const prisma = require('../config/database');

const auditLog = (tableName, action) => async (req, res, next) => {
  const originalSend = res.json.bind(res);
  
  res.json = async (body) => {
    if (body.success && req.user && req.auditData) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            tableName,
            recordId: req.auditData.recordId || req.params.id || 'N/A',
            oldValues: req.auditData.oldValues || null,
            newValues: req.auditData.newValues || req.body || null,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
          },
        });
      } catch (err) {
        console.error('Audit log error:', err);
      }
    }
    return originalSend(body);
  };
  
  next();
};

module.exports = auditLog;
