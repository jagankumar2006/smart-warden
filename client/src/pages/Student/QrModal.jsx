import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const QrModal = ({ isOpen, onClose, pass }) => {
  if (!pass) return null;

  const qrData = JSON.stringify({
    "Pass ID": pass.id.split('-')[0],
    "Student": pass.student.name,
    "Block": pass.student.hostel_block,
    "Valid From": new Date(pass.out_date).toLocaleDateString(),
    "Valid Until": new Date(pass.return_date).toLocaleDateString(),
    "Secure Token": pass.qr_token || pass.id
  }, null, 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold dark:text-white flex items-center">
                <QrCode className="mr-2 text-primary-500" /> E-Gate Pass
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100">
                <QRCodeSVG 
                  value={qrData} 
                  size={220}
                  level="H"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />
              </div>
              
              <div className="w-full space-y-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">Pass ID: <span className="font-mono text-gray-900 dark:text-white font-medium">{pass.id.split('-')[0]}</span></p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Scan this at the security gate for exit and entry.</p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 text-center">
              <button onClick={onClose} className="btn-primary w-full py-3">
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QrModal;
