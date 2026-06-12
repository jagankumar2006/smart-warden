import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from './store/useAuthStore';
import useToastStore from './store/useToastStore';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DashboardLayout from './layouts/DashboardLayout';
import StudentDashboard from './pages/Student/Dashboard';
import HodDashboard from './pages/HOD/Dashboard';
import WardenDashboard from './pages/Warden/Dashboard';
import SecurityDashboard from './pages/Security/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import Settings from './pages/Settings/Settings';
import Notifications from './pages/Notifications/Notifications';
import ToastContainer from './components/ui/ToastContainer';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Show loading spinner while fetching user data
  if (isAuthenticated && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-bg flex-col">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="ml-4 text-gray-500 font-medium">Waking up server...</p>
        </div>
        <p className="mt-8 text-sm text-gray-400 dark:text-gray-500 tracking-wide font-medium">
          Designed and built by JAGANKUMAR
        </p>
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

const DashboardRouter = () => {
  const { user } = useAuthStore();
  switch (user?.role) {
    case 'STUDENT': return <StudentDashboard />;
    case 'HOD': return <HodDashboard />;
    case 'WARDEN': return <WardenDashboard />;
    case 'SECURITY': return <SecurityDashboard />;
    case 'ADMIN': return <AdminDashboard />;
    default: return <div className="p-8"><h1>Welcome to Smart Warden</h1></div>;
  }
};

function App() {
  const { token, user, setUser, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const fetchUser = async () => {
      if (token) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            logout();
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchUser();
  }, [token, setUser, logout]);

  // Socket.IO Integration
  useEffect(() => {
    if (token && user) {
      const newSocket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`, {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to real-time server');
        // Join specific rooms to receive targeted notifications
        newSocket.emit('join', user.id);
        newSocket.emit('join', user.role);
      });

      newSocket.on('gate_pass_update', (data) => {
        addToast(data.message, data.status === 'REJECTED' ? 'warning' : 'success');
      });

      newSocket.on('new_gate_pass', (data) => {
        addToast(data.message, 'info');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token, user, addToast]);

  return (
    <Router>
      <div className="min-h-screen font-sans">
        <ToastContainer />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardRouter />} />
            <Route path="requests" element={<DashboardRouter />} />
            <Route path="approvals" element={<DashboardRouter />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
