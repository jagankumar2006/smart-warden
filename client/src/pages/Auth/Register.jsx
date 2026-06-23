import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, User, Building, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().min(1, 'Department is required'),
  hostel_block: z.string().min(1, 'Hostel block is required'),
});

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const { addToast } = useToastStore();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'STUDENT' }
  });

  const onRegister = async (data) => {
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'STUDENT' })
      });
      
      const resData = await res.json();
      
      if (res.ok) {
        // Automatically login after register
        const loginRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, password: data.password })
        });
        
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          setToken(loginData.token);
          setUser(loginData.user);
          addToast('Registration successful! Welcome to Smart Warden.', 'success');
          navigate('/');
        }
      } else {
        addToast(resData.message || 'Registration failed', 'warning');
      }
    } catch {
      addToast('Network error during registration', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-8 rounded-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Join Smart Warden today</p>
        </div>

        <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
          <div>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                {...register('name')}
                className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Full Name"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="email" 
                {...register('email')}
                className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="College Email Address"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="password" 
                {...register('password')}
                className={`input-field pl-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Password"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <Building className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type="text" 
                  {...register('department')}
                  className={`input-field pl-10 ${errors.department ? 'border-red-500' : ''}`}
                  placeholder="Department"
                />
              </div>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
            </div>
            <div>
              <div className="relative">
                <Building className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type="text" 
                  {...register('hostel_block')}
                  className={`input-field pl-10 ${errors.hostel_block ? 'border-red-500' : ''}`}
                  placeholder="Hostel Block"
                />
              </div>
              {errors.hostel_block && <p className="text-red-500 text-xs mt-1">{errors.hostel_block.message}</p>}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 mt-4"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </motion.div>
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          &copy; 2026 JAGANKUMAR. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
