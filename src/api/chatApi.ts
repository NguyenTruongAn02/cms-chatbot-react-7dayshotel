import api from "@/utils/apiConfig";
import { ChatMessage, ChatSession } from "@/utils/types/chat";

export const ChatService = {
    // Danh sách phòng đang mở
    getOpenSessions(): Promise<ChatSession[]> {
        return api.get("/chat/session/open");
    },

    // Lịch sử tin nhắn
    getMessages(sessionId: number): Promise<ChatMessage[]> {
        return api.get(`/chat/session/${sessionId}/messages`);
    },

    // Đóng phòng chat
    closeSession(sessionId: number) {
        return api.post(`/chat/session/${sessionId}/close`);
    },
};
