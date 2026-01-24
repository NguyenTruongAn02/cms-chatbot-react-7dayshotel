import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import config from "./config"; 

const api = axios.create({
    baseURL: config.apiUrl, 
    timeout: 15000,
});

// Interceptor cho Request
api.interceptors.request.use(
    (req: any) => { 
        const token = localStorage.getItem(config.tokenKey);

        if (token && req.headers) {
            req.headers.Authorization = `Bearer ${token}`;
        }
        return req;
    },
    (error) => Promise.reject(error)
);

// Interceptor cho Response
api.interceptors.response.use(
    (response: AxiosResponse) => {
        const res = response.data;
        
        if (res?.success !== undefined) {
            if (!res.success) {
                return Promise.reject(res);
            }
            return res.data; 
        }
        return res; 
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(config.tokenKey);
            window.location.replace("/login");
        }
        return Promise.reject(error);
    }
);

export default api;