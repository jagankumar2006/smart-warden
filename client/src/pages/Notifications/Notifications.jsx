import { motion } from 'framer-motion';
import { Bell, CheckCircle } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold dark:text-white">Notifications</h2>
        <p className="text-gray-500 dark:text-gray-400">View your recent alerts and updates</p>
      </div>

      <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 text-primary-500 rounded-full flex items-center justify-center mb-6">
          <Bell size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All caught up!</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          You don't have any new notifications at the moment. We'll alert you here when there are updates regarding gate passes.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 flex items-center space-x-2 text-primary-500 font-semibold"
          onClick={() => window.location.href = '/'}
        >
          <CheckCircle size={20} />
          <span>Return to Dashboard</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Notifications;
