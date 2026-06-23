const { z } = require('zod');

const register = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'HOD', 'WARDEN', 'SECURITY', 'ADMIN']).optional(),
    department: z.string().optional(),
    hostel_block: z.string().optional(),
  }),
});

const login = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const updateProfile = z.object({
  body: z.object({
    phone_number: z.string().optional(),
    emergency_contact: z.string().optional(),
  }),
});

const updatePassword = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

module.exports = {
  register,
  login,
  updateProfile,
  updatePassword,
};
