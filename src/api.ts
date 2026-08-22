
export const api = {
  get: async (endpoint: string) => {
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
    return res.json();
  },
  post: async (endpoint: string, data?: any) => {
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
  },
  put: async (endpoint: string, data?: any) => {
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
  },
  patch: async (endpoint: string, data?: any) => {
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
  },
  delete: async (endpoint: string) => {
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
  }
};
