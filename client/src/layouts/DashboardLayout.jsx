import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import useAuthStore from '../store/useAuthStore';
import { Bell, Menu } from 'lucide-react';

const DashboardLayout = () => {
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden relative">
      <Sidebar isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Navbar */}
        <header className="h-16 bg-white/50 dark:bg-dark-card/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg md:text-xl font-bold dark:text-white capitalize truncate">
              {user?.role?.toLowerCase()} Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
                {user?.profile_image ? (
                  <img src={(user.profile_image?.startsWith('http') ? user.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profile_image}`)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold dark:text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
