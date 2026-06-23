import { motion } from 'framer-motion';
import { Bell, Clock } from 'lucide-react';
import useNotificationStore from '../../store/useNotificationStore';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Notifications</h2>
          <p className="text-gray-500 dark:text-gray-400">View your recent alerts and updates</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={() => markAllAsRead()}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 text-primary-500 rounded-full flex items-center justify-center mb-6">
            <Bell size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All caught up!</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            You don't have any new notifications at the moment. We'll alert you here when there are updates regarding gate passes.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notification) => (
              <motion.div 
                key={notification.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-6 flex items-start gap-4 transition-colors ${notification.read ? 'bg-white dark:bg-dark-card' : 'bg-primary-50/50 dark:bg-primary-900/10'}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className={`mt-1 p-2 rounded-full ${notification.read ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400'}`}>
                  <Bell size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-base ${notification.read ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-900 dark:text-white font-bold'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 flex items-center whitespace-nowrap">
                      <Clock size={12} className="mr-1" />
                      {timeAgo(notification.created_at)}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${notification.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
