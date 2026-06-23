import { create } from 'zustand';
import { io } from 'socket.io-client';
import useToastStore from './useToastStore';

const URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const useNotificationStore = create((set, get) => ({
  socket: null,
  notifications: [],
  unreadCount: 0,
  
  connectSocket: (userId, role) => {
    const currentSocket = get().socket;
    if (currentSocket) return;

    const newSocket = io(URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      // Join individual user room and role-based room
      if (userId) newSocket.emit('join', userId);
      if (role) newSocket.emit('join', role);
    });

    newSocket.on('notification', (data) => {
      set((state) => {
        const newNotifications = [data, ...state.notifications];
        return {
          notifications: newNotifications,
          unreadCount: state.unreadCount + 1
        };
      });
      useToastStore.getState().addToast(data.message || data.title, 'info');
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, notifications: [], unreadCount: 0 });
    }
  },

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.is_read).length;
    set({ notifications, unreadCount });
  },

  markAsRead: (id) => {
    set((state) => {
      const updatedNotifications = state.notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      );
      const unreadCount = updatedNotifications.filter(n => !n.is_read).length;
      return { notifications: updatedNotifications, unreadCount };
    });
  }
}));

export default useNotificationStore;
