import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const NewPassModal = ({ isOpen, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [outDate, setOutDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('reason', reason);
    formData.append('out_date', outDate);
    formData.append('return_date', returnDate);
    if (document) {
      formData.append('document', document);
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/gatepass`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setReason('');
        setOutDate('');
        setReturnDate('');
        setDocument(null);
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create request');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-card w-full max-w-lg relative z-10 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">New Gate Pass Request</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Leave</label>
                <textarea 
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Please state your reason clearly..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Out Date & Time</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={outDate}
                    onChange={(e) => setOutDate(e.target.value)}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Return Date & Time</label>
                  <input 
                    required
                    type="datetime-local" 
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="input-field" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Document (Optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" type="file" className="sr-only" onChange={(e) => setDocument(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {document ? document.name : 'PNG, JPG, PDF up to 5MB'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewPassModal;
