import axios from 'axios';

// Si VITE_API_URL existe, se usa tal cual (no agregamos /api aquí).
// Si no existe, se usa host:8000 + /api como fallback.
const BASE = (() => {
  const envBase = import.meta.env.VITE_API_URL?.trim();
  if (envBase && envBase.length > 0) {
    return envBase.replace(/\/+$/, ''); // quita slashes al final
  }
  return `http://${window.location.hostname}:8000/api`;
})();

export const useApi = async function (url, method = 'GET', payload = undefined, extra = {}) {
  const endpoint = `${BASE}/${String(url).replace(/^\/+/, '')}`;

  const headers = {
    Accept: 'application/json',
    ...(extra.headers || {}),
  };

  const token = localStorage.getItem('access_token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  } else {
    delete headers['Content-Type'];
  }

  const config = {
    method,
    url: endpoint,
    headers,
    withCredentials: false,
  };

  if (payload !== undefined) {
    if (method.toUpperCase() === 'GET') {
      config.params = payload;
    } else {
      config.data = isFormData ? payload : JSON.stringify(payload);
    }
  }

  try {
    const { data } = await axios(config);
    return data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 || (status === 500 && data?.message === 'Token has expired')) {
        localStorage.removeItem('access_token');
        throw { status, data, redirect: true };
      }
      throw data ?? { message: 'Error en la solicitud.' };
    }
    console.error('Error en la API:', error);
    throw new Error('Error en la conexión con el servidor.');
  }
};
