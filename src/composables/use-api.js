import axios from 'axios';

const BASE = (
  import.meta.env.VITE_API_URL // opcional: .env puede definirlo
  || `http://${window.location.hostname}:8000` // usa el host actual (localhost o 192.168.2.93)
) + '/api';

export const useApi = async function (url, method = 'GET', payload = undefined, extra = {}) {
  const endpoint = `${BASE}/${String(url).replace(/^\/+/, '')}`;

  const headers = {
    Accept: 'application/json',
    ...(extra.headers || {}),
  };

  const token = localStorage.getItem('access_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  } else {
    // Deja que axios ponga boundary automáticamente
    delete headers['Content-Type'];
  }

  const config = {
    method,
    url: endpoint,
    headers,
    withCredentials: false, // usas JWT por header
  };

  if (payload !== undefined) {
    if (method.toUpperCase() === 'GET') {
      config.params = payload; // GET -> querystring
    } else {
      config.data = isFormData ? payload : JSON.stringify(payload);
    }
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (
        status === 401 ||
        (status === 500 && data?.message === 'Token has expired')
      ) {
        localStorage.removeItem('access_token');
        throw { status, data, redirect: true };
      } else {
        throw data ?? { message: 'Error en la solicitud.' };
      }
    } else {
      console.error('Error en la API:', error);
      throw new Error('Error en la conexión con el servidor.');
    }
  }
};
