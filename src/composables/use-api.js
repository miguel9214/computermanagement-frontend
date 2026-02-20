import axios from "axios";

// 🚀 Vite cargará automáticamente la URL del .env correspondiente
const BASE = import.meta.env.VITE_API_URL;

console.log("🌐 BASE API URL:", BASE);

export const useApi = async function (
  url,
  method = "GET",
  payload = undefined,
  extra = {}
) {
  // Limpia posibles barras diagonales duplicadas
  const cleanUrl = String(url).replace(/^\/+/, "");
  const endpoint = `${BASE}/${cleanUrl}`;

  const headers = {
    Accept: "application/json",
    ...(extra.headers || {}),
  };

  const token = localStorage.getItem("access_token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method,
    url: endpoint,
    headers,
    withCredentials: false,
  };

  if (payload !== undefined) {
    if (method.toUpperCase() === "GET") {
      config.params = payload;
    } else {
      config.data = isFormData ? payload : JSON.stringify(payload);
    }
  }

  try {
    const { data } = await axios(config);

    if ((url.includes("login") || url.includes("register")) && data?.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }

    return data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 || (status === 500 && data?.message === "Token has expired")) {
        localStorage.removeItem("access_token");
        throw { status, data, redirect: true };
      }
      throw data ?? { message: "Error en la solicitud." };
    }
    throw new Error("Error en la conexión con el servidor.");
  }
};
