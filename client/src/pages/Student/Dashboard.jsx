import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle, XCircle, FileText, QrCode } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import NewPassModal from './NewPassModal';
import QrModal from './QrModal';

const StudentDashboard = () => {
  const [passes, setPasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPassForQr, setSelectedPassForQr] = useState(null);
  const { token } = useAuthStore();
  const location = useLocation();

  const fetchPasses = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gatepass`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPasses(data.gatePasses);
      }
    } catch (error) {
      console.error('Error fetching passes:', error);
    }
  };

  useEffect(() => {
    fetchPasses();
    // In a real app, socket listener would be attached here
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'REJECTED': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle size={16} className="mr-1" />;
      case 'REJECTED': return <XCircle size={16} className="mr-1" />;
      default: return <Clock size={16} className="mr-1" />;
    }
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">My Gate Passes</h2>
          <p className="text-gray-500 dark:text-gray-400">Track and manage your leave requests</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center shadow-lg shadow-primary-500/30"
        >
          <Plus size={20} className="mr-2" />
          New Request
        </motion.button>
      </div>

      {location.pathname === '/' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 border-l-4 border-l-primary-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Requests</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{passes.length}</p>
          </div>
          <div className="glass-card p-6 border-l-4 border-l-yellow-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {passes.filter(p => p.status.includes('PENDING')).length}
            </p>
          </div>
          <div className="glass-card p-6 border-l-4 border-l-green-500">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Approved</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {passes.filter(p => p.status === 'APPROVED').length}
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-card/80 border-b border-gray-200 dark:border-gray-800">
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Reason</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Out Date</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Return Date</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Document</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Gate Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {passes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No gate passes found. Create a new request to get started.
                    </td>
                  </tr>
                ) : (
                  passes.map((pass) => (
                    <tr key={pass.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-4 text-sm text-gray-900 dark:text-gray-200 font-medium">
                        {pass.reason}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(pass.out_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(pass.return_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(pass.status)}`}>
                          {getStatusIcon(pass.status)}
                          {formatStatus(pass.status)}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                        {pass.document_url ? (
                          <a href={(pass.document_url?.startsWith('http') ? pass.document_url : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${pass.document_url}`)} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600 flex items-center">
                            <FileText size={16} className="mr-1" /> View
                          </a>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-right">
                        {pass.status === 'APPROVED' && (
                          <button 
                            onClick={() => setSelectedPassForQr(pass)}
                            className="inline-flex items-center px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors font-medium"
                          >
                            <QrCode size={16} className="mr-1.5" /> Show QR
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <NewPassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchPasses} 
      />
      
      <QrModal 
        isOpen={!!selectedPassForQr}
        onClose={() => setSelectedPassForQr(null)}
        pass={selectedPassForQr}
      />
    </div>
  );
};

export default StudentDashboard;
