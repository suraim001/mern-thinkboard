import axios from "axios";

export const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api"
export const TOKEN_KEY = "thinkboard_token";

const api = axios.create({
    baseURL: BASE_URL
});

// attach the jwt to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// token expired or invalid => send the user back to login
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            const publicPages = ["/login", "/signup"];
            if (!publicPages.includes(window.location.pathname)) window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
