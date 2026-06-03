import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Building, Lock } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';

const Settings = () => {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { addToast } = useToastStore();
  const fileInputRef = useRef(null);

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_image', file);

    setUploadingImage(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile-picture`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        addToast('Profile picture updated successfully', 'success');
        // Safely get latest user state to avoid closure bugs
        const currentUser = useAuthStore.getState().user;
        useAuthStore.getState().setUser({ ...currentUser, profile_image: data.profile_image });
      } else {
        addToast(data.message || 'Failed to update image', 'warning');
      }
    } catch (error) {
      addToast('Network error while updating image', 'warning');
    } finally {
      setUploadingImage(false);
      if (e.target) {
        e.target.value = null; // Reset input so the same file can be selected again
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${useAuthStore.getState().token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      
      if (res.ok) {
        addToast('Password updated successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        addToast(data.message || 'Failed to update password', 'warning');
      }
    } catch (error) {
      addToast('Network error while updating password', 'warning');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold dark:text-white">Account Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage your profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Information */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8"
          >
            <h3 className="text-lg font-bold dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Profile Details</h3>
            
            <div className="flex items-center space-x-6 mb-8">
              <div 
                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg cursor-pointer overflow-hidden group"
                onClick={() => fileInputRef.current.click()}
              >
                {user.profile_image ? (
                  <img src={(user.profile_image?.startsWith('http') ? user.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profile_image}`)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium">
                    {uploadingImage ? 'Uploading...' : 'Change'}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold dark:text-white">{user.name}</h4>
                <p className="text-gray-500 dark:text-gray-400 capitalize">{user.role.toLowerCase()}</p>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleProfilePictureUpload} 
                accept="image/png, image/jpeg, image/jpg" 
                className="hidden" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="flex items-center space-x-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <Mail size={18} className="text-primary-500" />
                  <span>{user.email}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Role Access</label>
                <div className="flex items-center space-x-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <Shield size={18} className="text-primary-500" />
                  <span>{user.role}</span>
                </div>
              </div>

              {user.department && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Department</label>
                  <div className="flex items-center space-x-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <Building size={18} className="text-primary-500" />
                    <span>{user.department}</span>
                  </div>
                </div>
              )}

              {user.hostel_block && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hostel Block</label>
                  <div className="flex items-center space-x-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <Building size={18} className="text-primary-500" />
                    <span>Block {user.hostel_block}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Security Settings */}
        <div className="md:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-bold dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Security</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="w-full btn-primary flex justify-center items-center py-2.5">
                <Lock size={16} className="mr-2" /> Update Password
              </button>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
