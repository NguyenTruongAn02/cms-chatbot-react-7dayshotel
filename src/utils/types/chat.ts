export type SenderType = "CLIENT" | "STAFF" | "BOT";
export type SessionStatus = "OPEN" | "CLOSED";

export interface ChatSession {
    id: number;
    sessionCode: string;
    clientLang: string;
    clientIdentifier?: string | null;

    status: SessionStatus;

    assignedStaffId?: number | null;
    botEnabled: boolean;

    createdAt: string;
    lastMessageAt?: string | null;
}

export interface ChatMessage {
    id: number;
    session: ChatSession;

    sender: SenderType;

    originalText: string;
    translatedText: string;

    createdAt: string;
}
