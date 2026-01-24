import { io, Socket } from "socket.io-client";
import config from "./config";

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        // Lấy token từ localStorage dựa trên key trong file config
        const token = localStorage.getItem(config.tokenKey);

        socket = io(config.socketUrl, {
            transports: ["websocket"],
            reconnectionAttempts: 5, // Thử kết nối lại 5 lần nếu lỗi
            reconnectionDelay: 1000,
            auth: {
                token: token,
            },
        });

        // Debug nhanh trong quá trình phát triển
        if (config.isDev) {
            socket.on("connect", () => {
                console.log("✅ Socket connected:", socket?.id);
            });

            socket.on("connect_error", (err: any) => {
                console.error("❌ Socket connection error:", err.message);
            });
        }
    }
    return socket;
};

// Hàm để ngắt kết nối khi logout
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};