// src/composables/use-api.js

import axios from 'axios';

export const useApi = async function (url, method = 'GET', payload = {}) {
    url = `http://computermanagement-backend.test/api/${url}`;

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        const token = localStorage.getItem("access_token");
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const config = {
            method: method,
            url: url,
            data: payload,
            headers: headers,
        };

        const response = await axios(config);
        return response.data;

    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;

            if (
                status === 401 ||
                (status === 500 && data.message === "Token has expired")
            ) {
                localStorage.removeItem("access_token"); // Elimina el token inválido
                throw { status, data, redirect: true };   // Indicamos que redirija al login
            } else {
                throw data; // Otro error manejable en el frontend
            }

        } else {
            console.error("Error en la API:", error);
            throw new Error("Error en la conexión con el servidor.");
        }
    }
};
