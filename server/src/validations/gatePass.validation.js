const { z } = require('zod');

const createGatePass = z.object({
  body: z.object({
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
    out_date: z.string().datetime({ message: 'out_date must be a valid ISO datetime' }),
    return_date: z.string().datetime({ message: 'return_date must be a valid ISO datetime' }),
  }),
});

const updateGatePassStatus = z.object({
  body: z.object({
    status: z.enum(['PENDING_HOD', 'PENDING_WARDEN', 'APPROVED', 'REJECTED', 'EXITED', 'RETURNED']),
    rejection_reason: z.string().optional(),
  }),
});

module.exports = {
  createGatePass,
  updateGatePassStatus,
};
