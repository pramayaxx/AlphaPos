import { useEffect, useState } from 'react';
import { localDB } from './localDB';
import { api } from './api';

export function useSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const updatePendingCount = async () => {
    const count = await localDB.syncQueue.count();
    setPendingCount(count);
  };

  const syncNow = async () => {
    if (!navigator.onLine || isSyncing) return;
    
    try {
      setIsSyncing(true);
      setSyncError(null);
      
      const queue = await localDB.syncQueue.orderBy('createdAt').toArray();
      if (queue.length === 0) {
        setIsSyncing(false);
        return;
      }
      
      for (const item of queue) {
        try {
          if (item.method === 'POST') {
            await api.post(item.endpoint, item.data);
          } else if (item.method === 'PUT') {
            await api.put(item.endpoint, item.data);
          } else if (item.method === 'PATCH') {
            await api.patch(item.endpoint, item.data);
          } else if (item.method === 'DELETE') {
            await api.delete(item.endpoint);
          }
          
          // Remove from queue if successful
          if (item.id) {
            await localDB.syncQueue.delete(item.id);
          }
        } catch (e: any) {
          // If it's a real server error (e.g. 400 Bad Request), we might want to log it and remove from queue to avoid blocking
          // If it's a network error, break and try again later
          if (e.message === 'Failed to fetch' || !navigator.onLine) {
            throw e;
          } else {
            console.error(`Sync error for ${item.method} ${item.endpoint}:`, e);
            // Optionally delete it if it's a permanent error
             if (item.id) {
               await localDB.syncQueue.delete(item.id);
             }
          }
        }
      }
      
      // Refresh local caches by re-fetching basic data (optional, but good for fresh state)
      // await Promise.all([
      //   api.get('/products'),
      //   api.get('/customers'),
      //   api.get('/bills')
      // ]);
      
      await updatePendingCount();
    } catch (e: any) {
      setSyncError('Sync interrupted: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    updatePendingCount();
    // Also update count periodically in case of offline mutations
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncNow();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial sync if online
    if (navigator.onLine) {
      syncNow();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isSyncing, syncError, pendingCount, syncNow };
}
