const config = {
    appName: String(import.meta.env.VITE_APP_NAME || "Hotel 7 Days"),
    apiUrl: String(import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"),
    socketUrl: String(import.meta.env.VITE_SOCKET_URL || "http://localhost:8080"),
    tokenKey: String(import.meta.env.VITE_AUTH_TOKEN_KEY || "hotel7days_token"),
    chatPageSize: Number(import.meta.env.VITE_CHAT_PAGE_SIZE) || 20,
    isDev: Boolean(import.meta.env.DEV), 
};

export default config;