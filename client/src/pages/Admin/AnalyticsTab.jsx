import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../../store/useAuthStore';
import useToastStore from '../../store/useToastStore';

const AnalyticsTab = () => {
  const { token } = useAuthStore();
  const { addToast } = useToastStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const resData = await res.json();
          // Sort by date ascending for chart
          const sortedData = resData.dailyRequests.sort((a, b) => new Date(a.date) - new Date(b.date));
          const chartData = sortedData.map(item => ({
            date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            requests: item.count
          }));
          setData(chartData);
        } else {
          addToast('Failed to fetch analytics', 'error');
        }
      } catch (error) {
        addToast('Network error', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) return <div className="text-center py-8">Loading analytics...</div>;

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold dark:text-white mb-6">Pass Requests Over Time (Last 30 Days)</h2>
      <div className="h-80 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#60A5FA' }}
              />
              <Bar dataKey="requests" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available for the selected period.
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
