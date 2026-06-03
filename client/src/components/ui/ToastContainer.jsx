import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import useToastStore from '../../store/useToastStore';

const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`pointer-events-auto w-80 glass-card p-4 flex items-start shadow-2xl border-l-4 
              ${toast.type === 'success' ? 'border-l-green-500' : 
                toast.type === 'warning' ? 'border-l-yellow-500' : 
                'border-l-primary-500'}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="text-yellow-500" size={20} />
              ) : (
                <Info className="text-primary-500" size={20} />
              )}
            </div>
            <div className="ml-3 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {toast.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => removeToast(toast.id)}
              >
                <span className="sr-only">Close</span>
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
