import { localDB } from './localDB';

const isOfflineError = (e: any) => {
  return !navigator.onLine || e.message === 'Failed to fetch' || e.message === 'NetworkError' || e.message.includes('Network request failed');
};

const handleOfflineRead = async (endpoint: string, e: any) => {
  if (isOfflineError(e)) {
    const cached = await localDB.cache.get(endpoint);
    if (cached) {
      console.warn(`[Offline Mode] Returning cached data for ${endpoint}`);
      return cached.data;
    }
  }
  throw e;
};

const handleOfflineMutation = async (endpoint: string, method: string, data?: any) => {
  console.warn(`[Offline Mode] Queuing ${method} ${endpoint}`);
  await localDB.syncQueue.add({
    endpoint,
    method,
    data,
    createdAt: Date.now()
  });

  // Provide a fake optimistic response based on endpoint
  if (endpoint === '/bills' && method === 'POST') {
    const fakeId = 'local-' + Date.now();
    const fakeBill = {
      ...data,
      id: fakeId,
      uuid: 'INV-OFFLINE-' + Math.floor(Math.random() * 10000),
      dateTime: new Date().toISOString(),
      items: data.items || [],
      subtotal: data.subtotal || 0,
      discount: data.discount || 0,
      grandTotal: data.grandTotal || 0,
      isPrinted: data.isPrinted || false,
      taxAmount: data.taxAmount || 0,
      taxRate: data.taxRate || 0,
      customerId: data.customerId,
      paymentMethod: data.paymentMethod || 'cash',
      status: data.status || 'paid',
      _isOffline: true
    };
    
    // Optimistically update the bills cache
    const billsCache = await localDB.cache.get('/bills');
    if (billsCache) {
      billsCache.data = [fakeBill, ...(Array.isArray(billsCache.data) ? billsCache.data : [])];
      await localDB.cache.put(billsCache);
    }
    
    return fakeBill;
  }
  
  if (endpoint === '/customers' && method === 'POST') {
    const fakeCustomer = {
      ...data,
      id: 'local-cust-' + Date.now(),
      _isOffline: true
    };
    
    // Optimistically update the customers cache
    const custCache = await localDB.cache.get('/customers');
    if (custCache) {
      custCache.data = [fakeCustomer, ...(Array.isArray(custCache.data) ? custCache.data : [])];
      await localDB.cache.put(custCache);
    }
    return fakeCustomer;
  }

  return { success: true, _isOffline: true, message: 'Saved locally for sync' };
};

export const api = {
  get: async (endpoint: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api' + endpoint, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) {
        let errText = await res.text();
        try {
          const json = JSON.parse(errText);
          if (json.message) errText = json.message;
          else if (json.error) errText = json.error;
        } catch (e) {}
        throw new Error(errText);
      }
      const data = await res.json();
      await localDB.cache.put({ endpoint, data, timestamp: Date.now() });
      return data;
    } catch (e: any) {
      return await handleOfflineRead(endpoint, e);
    }
  },
  post: async (endpoint: string, data?: any) => {
    try {
      if (!navigator.onLine) throw new Error('Failed to fetch');
      const token = localStorage.getItem('token');
      const res = await fetch('/api' + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        let errText = await res.text();
        try {
          const json = JSON.parse(errText);
          if (json.message) errText = json.message;
          else if (json.error) errText = json.error;
        } catch (e) {}
        throw new Error(errText);
      }
      return res.json();
    } catch (e: any) {
      if (isOfflineError(e) && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        return await handleOfflineMutation(endpoint, 'POST', data);
      }
      throw e;
    }
  },
  put: async (endpoint: string, data?: any) => {
    try {
      if (!navigator.onLine) throw new Error('Failed to fetch');
      const token = localStorage.getItem('token');
      const res = await fetch('/api' + endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        let errText = await res.text();
        try {
          const json = JSON.parse(errText);
          if (json.message) errText = json.message;
          else if (json.error) errText = json.error;
        } catch (e) {}
        throw new Error(errText);
      }
      return res.json();
    } catch (e: any) {
      if (isOfflineError(e)) {
        return await handleOfflineMutation(endpoint, 'PUT', data);
      }
      throw e;
    }
  },
  patch: async (endpoint: string, data?: any) => {
    try {
      if (!navigator.onLine) throw new Error('Failed to fetch');
      const token = localStorage.getItem('token');
      const res = await fetch('/api' + endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        let errText = await res.text();
        try {
          const json = JSON.parse(errText);
          if (json.message) errText = json.message;
          else if (json.error) errText = json.error;
        } catch (e) {}
        throw new Error(errText);
      }
      return res.json();
    } catch (e: any) {
      if (isOfflineError(e)) {
        return await handleOfflineMutation(endpoint, 'PATCH', data);
      }
      throw e;
    }
  },
  delete: async (endpoint: string) => {
    try {
      if (!navigator.onLine) throw new Error('Failed to fetch');
      const token = localStorage.getItem('token');
      const res = await fetch('/api' + endpoint, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) {
        let errText = await res.text();
        try {
          const json = JSON.parse(errText);
          if (json.message) errText = json.message;
          else if (json.error) errText = json.error;
        } catch (e) {}
        throw new Error(errText);
      }
      return res.json();
    } catch (e: any) {
      if (isOfflineError(e)) {
        return await handleOfflineMutation(endpoint, 'DELETE', null);
      }
      throw e;
    }
  }
};
