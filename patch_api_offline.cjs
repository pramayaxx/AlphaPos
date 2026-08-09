const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');

const offlineApi = `
import localforage from 'localforage';

const requestQueue = localforage.createInstance({ name: 'pos_offline_queue' });

// Offline Sync Logic
window.addEventListener('online', async () => {
  console.log('Back online! Syncing data...');
  const keys = await requestQueue.keys();
  for (const key of keys) {
    const req = await requestQueue.getItem(key);
    if (req) {
      try {
        await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body
        });
        await requestQueue.removeItem(key);
      } catch(e) {
        console.error('Failed to sync req:', key);
      }
    }
  }
});

const enhancedApi = {
  get: api.get,
  post: async (endpoint, data) => {
    if (!navigator.onLine) {
      const id = Date.now().toString();
      await requestQueue.setItem(id, {
        url: '/api' + endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('alpha_token')}\`
        },
        body: JSON.stringify(data)
      });
      alert('You are offline. Request queued for sync.');
      return { offline: true, id };
    }
    return api.post(endpoint, data);
  },
  put: api.put,
  delete: api.delete
};

window.api = enhancedApi;
`;

if (!code.includes('pos_offline_queue')) {
  code = code.replace(/window\.api = api;/, offlineApi);
  fs.writeFileSync('src/main.tsx', code);
  console.log("Patched main.tsx for offline mode");
}
