const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Logs an action to the AuditLog.
 * @param {Object} params
 * @param {string} params.actionType - A concise string describing the action (e.g. 'USER_LOGIN', 'PASS_CREATED')
 * @param {string} params.description - A detailed description of the action
 * @param {string} [params.userId] - The ID of the user performing the action
 * @param {string} [params.userRole] - The role of the user
 * @param {string} [params.passId] - The ID of the gate pass involved, if any
 * @param {string} [params.ipAddress] - The IP address from the request
 */
const logAction = async ({ actionType, description, userId, userRole, passId, ipAddress }) => {
  try {
    await prisma.auditLog.create({
      data: {
        actionType,
        description,
        userId,
        userRole,
        passId,
        ipAddress
      }
    });
  } catch (error) {
    console.error('Failed to write to audit log:', error);
  }
};

module.exports = {
  logAction
};
