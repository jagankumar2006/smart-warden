import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useToastStore from '../../store/useToastStore';

const schema = z.object({
  email: z.string().email('Invalid email format')
});

const ForgotPassword = () => {
  const { addToast } = useToastStore();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recovery/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        setSuccess(true);
        addToast('Reset link sent to your email', 'success');
      } else {
        const errorData = await res.json().catch(() => null);
        addToast(errorData?.message || 'Failed to send reset link', 'error');
      }
    } catch {
      addToast('Network error', 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold dark:text-white">Smart Warden</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Password Recovery</p>
        </div>

        <div className="glass-card p-8 shadow-xl">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold dark:text-white">Check Your Email</h3>
              <p className="text-gray-500 dark:text-gray-400">
                We've sent a password reset link to your email address. It will expire in 30 minutes.
              </p>
              <Link to="/login" className="block w-full btn-primary py-2.5 mt-4">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="email"
                    {...register('email')}
                    className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="student@university.edu"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 shadow-lg shadow-primary-500/30 font-semibold"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <ArrowLeft size={16} className="mr-2" /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
