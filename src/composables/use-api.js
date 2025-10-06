import axios from "axios";

const BASE = "https://p.gpsmonitoreorada.site/api"


console.log("🌐 BASE API URL:", BASE);

export const useApi = async function (
  url,
  method = "GET",
  payload = undefined,
  extra = {}
) {
  const endpoint = `${BASE}/${String(url).replace(/^\/+/, "")}`;

  const headers = {
    Accept: "application/json",
    ...(extra.headers || {}),
  };

  // ⏺ Recuperar token guardado en localStorage
  const token = localStorage.getItem("access_token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const isFormData =
    typeof FormData !== "undefined" && payload instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  } else {
    delete headers["Content-Type"];
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

    // 🔐 Si la ruta es login o register y hay token => guardarlo
    if (
      (url.includes("login") || url.includes("register")) &&
      data?.access_token
    ) {
      localStorage.setItem("access_token", data.access_token);
    }

    return data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (
        status === 401 ||
        (status === 500 && data?.message === "Token has expired")
      ) {
        // ⏺ Limpiamos token y forzamos redirect
        localStorage.removeItem("access_token");
        throw { status, data, redirect: true };
      }

      throw data ?? { message: "Error en la solicitud." };
    }

    console.error("Error en la API:", error);
    throw new Error("Error en la conexión con el servidor.");
  }
};
