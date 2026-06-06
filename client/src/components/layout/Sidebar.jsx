import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Bell, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/', roles: ['STUDENT', 'HOD', 'WARDEN', 'SECURITY', 'ADMIN'] },
    { name: 'My Requests', icon: FileText, path: '/requests', roles: ['STUDENT'] },
    { name: 'Approvals', icon: CheckSquare, path: '/approvals', roles: ['HOD', 'WARDEN'] },
    { name: 'Notifications', icon: Bell, path: '/notifications', roles: ['STUDENT', 'HOD', 'WARDEN', 'SECURITY', 'ADMIN'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['STUDENT', 'HOD', 'WARDEN', 'SECURITY', 'ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={false}
        animate={{ 
          width: isOpen ? 280 : 80,
          x: isMobileOpen ? 0 : -280
        }}
        className={`fixed md:static h-screen bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 z-40 md:translate-x-0 ${!isMobileOpen ? 'w-[280px] -translate-x-full' : 'translate-x-0'} md:w-auto`}
      >
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center space-x-2 overflow-hidden whitespace-nowrap"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {user?.profile_image ? (
                  <img src={(user.profile_image?.startsWith('http') ? user.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profile_image}`)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">S</span>
                )}
              </div>
              <span className="font-bold text-xl dark:text-white">Smart Warden</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}
            `}
          >
            <item.icon size={22} className="shrink-0" />
            <AnimatePresence>
              {isOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <Sun size={22} className="shrink-0" /> : <Moon size={22} className="shrink-0" />}
          <AnimatePresence>
            {isOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button 
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={22} className="shrink-0" />
          <AnimatePresence>
            {isOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap font-medium">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
    </>
  );
};

export default Sidebar;
