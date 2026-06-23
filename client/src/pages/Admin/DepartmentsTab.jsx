import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';

const DepartmentsTab = () => {
  const { token } = useAuthStore();
  const { addToast } = useToastStore();
  const [departments, setDepartments] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [newDept, setNewDept] = useState('');
  const [newHostel, setNewHostel] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [deptRes, hostelRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/departments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/hostels`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      if (deptRes.ok && hostelRes.ok) {
        const deptData = await deptRes.json();
        const hostelData = await hostelRes.json();
        setDepartments(deptData.departments);
        setHostels(hostelData.blocks);
      }
    } catch (error) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreate = async (type, name, setName) => {
    if (!name.trim()) return;
    try {
      const url = type === 'dept' ? '/api/admin/departments' : '/api/admin/hostels';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name })
      });
      
      if (res.ok) {
        addToast(`${type === 'dept' ? 'Department' : 'Hostel'} created`, 'success');
        setName('');
        fetchData();
      } else {
        addToast('Failed to create', 'error');
      }
    } catch (error) {
      addToast('Network error', 'error');
    }
  };

  const handleDelete = async (type, id) => {
    try {
      const url = type === 'dept' ? `/api/admin/departments/${id}` : `/api/admin/hostels/${id}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${url}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        addToast('Deleted successfully', 'success');
        fetchData();
      } else {
        addToast('Failed to delete', 'error');
      }
    } catch (error) {
      addToast('Network error', 'error');
    }
  };

  if (loading) return <div className="text-center py-8">Loading management settings...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold dark:text-white mb-6">Manage Departments</h2>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="New Department Name" 
            className="input-field" 
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
          />
          <button 
            onClick={() => handleCreate('dept', newDept, setNewDept)}
            className="btn-primary flex items-center justify-center p-2 rounded"
          >
            <Plus size={20} />
          </button>
        </div>
        <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {departments.map(dept => (
            <li key={dept.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="dark:text-gray-200">{dept.name}</span>
              <button onClick={() => handleDelete('dept', dept.id)} className="text-red-500 hover:text-red-600">
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold dark:text-white mb-6">Manage Hostel Blocks</h2>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="New Hostel Block Name" 
            className="input-field" 
            value={newHostel}
            onChange={(e) => setNewHostel(e.target.value)}
          />
          <button 
            onClick={() => handleCreate('hostel', newHostel, setNewHostel)}
            className="btn-primary flex items-center justify-center p-2 rounded"
          >
            <Plus size={20} />
          </button>
        </div>
        <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {hostels.map(hostel => (
            <li key={hostel.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="dark:text-gray-200">{hostel.name}</span>
              <button onClick={() => handleDelete('hostel', hostel.id)} className="text-red-500 hover:text-red-600">
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DepartmentsTab;
