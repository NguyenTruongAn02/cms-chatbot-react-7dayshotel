export type SenderType = "CLIENT" | "STAFF" | "BOT";
export type SessionStatus = "OPEN" | "CLOSED";
export type BookingStatus = "NONE" | "PAST" | "ACTIVE" | "CANCELLED";

export interface ChatSession {
    id: number;
    sessionCode: string;
    clientLang: string;
    clientIdentifier?: string | null;

    status: SessionStatus;

    assignedStaffId?: number | null;
    botEnabled: boolean;

    customerId?: number | null;
    customerName?: string | null;
    customerEmail?: string | null;
    membershipLevel?: string | null;

    bookingStatus: BookingStatus;
    bookingCode?: string | null;

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