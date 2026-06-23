import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle, Search, User, XCircle } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import QRScanner from '../../components/ui/QRScanner';

const SecurityDashboard = () => {
  const [passes, setPasses] = useState([]);
  const [qrToken, setQrToken] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [recentScans, setRecentScans] = useState([]);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gatepass`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter passes that are ready for exit OR currently out of campus
          const activePasses = data.gatePasses.filter(p => p.status === 'APPROVED' || p.status === 'EXITED');
          setPasses(activePasses);
          
          // Setup recent scans (recently RETURNED or EXITED)
          const recent = data.gatePasses
            .filter(p => p.status === 'RETURNED' || p.status === 'EXITED')
            .sort((a, b) => new Date(b.updated_at || b.out_date) - new Date(a.updated_at || a.out_date));
          setRecentScans(recent);
        }
      } catch (error) {
        console.error('Error fetching passes:', error);
      }
    };
    fetchPasses();
  }, [token]);

  const fetchPassesAfterAction = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gatepass`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const activePasses = data.gatePasses.filter(p => p.status === 'APPROVED' || p.status === 'EXITED');
        setPasses(activePasses);
        
        const recent = data.gatePasses
          .filter(p => p.status === 'RETURNED' || p.status === 'EXITED')
          .sort((a, b) => new Date(b.updated_at || b.out_date) - new Date(a.updated_at || a.out_date));
        setRecentScans(recent);
      }
    } catch (error) {
      console.error('Error fetching passes:', error);
    }
  };

  const processScan = (scannedToken) => {
    setLoading(true);
    setScanResult(null);

    try {
      const pass = passes.find(p => 
        scannedToken.includes(p.qr_token) || 
        scannedToken === p.id || 
        scannedToken.includes(p.id.split('-')[0])
      );
      
      setTimeout(() => {
        if (pass) {
          setScanResult({ success: true, pass });
        } else {
          setScanResult({ success: false, message: 'Invalid or Expired QR Token' });
        }
        setLoading(false);
      }, 800);
    } catch (error) {
      setScanResult({ success: false, message: 'Scan failed due to server error' });
      setLoading(false);
    }
  };

  const handleScanDirect = (tokenValue) => {
    if (!tokenValue || !tokenValue.trim()) return;
    processScan(tokenValue.trim());
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!qrToken.trim()) return;
    processScan(qrToken.trim());
  };

  const handleAction = async (id, actionStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gatepass/${id}/status`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: actionStatus }),
      });

      if (res.ok) {
        const msg = actionStatus === 'EXITED' ? 'Student successfully marked as EXITED.' : 'Student successfully RETURNED.';
        setScanResult({ success: true, message: msg });
        fetchPassesAfterAction();
      } else {
        const errorData = await res.json().catch(() => null);
        setScanResult({ success: false, message: errorData?.message || `Failed to update status. Please check server logs.` });
      }
    } catch {
      setScanResult({ success: false, message: 'Network error or server is unreachable.' });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold dark:text-white flex items-center">
          <QrCode className="mr-2 text-primary-500" /> Gate Scanner Panel
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Scan student QR codes to verify and authorize exit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Scanner Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border-t-4 border-t-primary-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-white">QR Code Scanner</h3>
              <button 
                onClick={() => setIsScannerActive(!isScannerActive)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                {isScannerActive ? 'Switch to Manual' : 'Use Camera'}
              </button>
            </div>

            {isScannerActive ? (
              <div className="mb-4">
                <QRScanner 
                  onScanSuccess={(decodedText) => {
                    setQrToken(decodedText);
                    setIsScannerActive(false); // Stop scanner
                    handleScanDirect(decodedText); // Directly submit the scanned text
                  }}
                />
              </div>
            ) : (
              <form onSubmit={handleScan} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Enter Pass ID or QR Token</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={qrToken}
                      onChange={(e) => setQrToken(e.target.value)}
                      className="input-field pl-10"
                      placeholder="e.g. 9b1deb4d..."
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary flex justify-center items-center py-3"
                >
                  {loading ? 'Scanning...' : 'Scan / Verify'}
                </button>
              </form>
            )}
          </div>

          {/* Scan Results */}
          {scanResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card p-6 border-l-4 ${scanResult.success ? 'border-l-green-500' : 'border-l-red-500'}`}
            >
              {scanResult.success && scanResult.pass ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-green-600 dark:text-green-400">AUTHORIZED</h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-left space-y-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{scanResult.pass.student.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{scanResult.pass.student.department}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Block {scanResult.pass.student.hostel_block}</p>
                  </div>
                  {scanResult.pass.status === 'APPROVED' ? (
                    <button onClick={() => handleAction(scanResult.pass.id, 'EXITED')} className="w-full btn-primary bg-green-500 hover:bg-green-600 shadow-green-500/30 py-3">
                      Confirm Exit
                    </button>
                  ) : (
                    <button onClick={() => handleAction(scanResult.pass.id, 'RETURNED')} className="w-full btn-primary bg-blue-500 hover:bg-blue-600 shadow-blue-500/30 py-3">
                      Confirm Return
                    </button>
                  )}
                </div>
              ) : scanResult.success ? (
                 <div className="text-center text-green-500">
                   <CheckCircle size={48} className="mx-auto mb-2" />
                   <p className="font-bold">{scanResult.message}</p>
                 </div>
              ) : (
                <div className="text-center text-red-500">
                  <XCircle size={48} className="mx-auto mb-2" />
                  <p className="font-bold">ACCESS DENIED</p>
                  <p className="text-sm mt-2">{scanResult.message}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Column: Tabs and Lists */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'active'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Active Gate Passes
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'recent'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Recent Scans
            </button>
          </div>

          <div className="glass-card p-6 flex-1">
             <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {activeTab === 'active' ? (
                  passes.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No active passes at the moment.</p>
                  ) : (
                    passes.map(pass => (
                      <div key={pass.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer" onClick={() => setQrToken(pass.id)}>
                        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 overflow-hidden">
                            {pass.student.profile_image ? (
                              <img src={(pass.student.profile_image?.startsWith('http') ? pass.student.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${pass.student.profile_image}`)} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{pass.student.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {pass.id.split('-')[0]}...</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pass.status === 'APPROVED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {pass.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right w-full sm:w-auto">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Out: {new Date(pass.out_date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">Return: {new Date(pass.return_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  recentScans.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No recent scans.</p>
                  ) : (
                    recentScans.map(pass => (
                      <div key={pass.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors border border-transparent border-l-4 border-l-gray-300">
                        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 overflow-hidden">
                            {pass.student.profile_image ? (
                              <img src={(pass.student.profile_image?.startsWith('http') ? pass.student.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${pass.student.profile_image}`)} alt="Profile" className="w-full h-full object-cover grayscale" />
                            ) : (
                              <User size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{pass.student.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {pass.id.split('-')[0]}...</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pass.status === 'RETURNED' ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-600'}`}>
                                {pass.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right w-full sm:w-auto">
                          <p className="text-xs text-gray-500">Last Scanned: {new Date(pass.updated_at || pass.out_date).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )
                )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SecurityDashboard;
