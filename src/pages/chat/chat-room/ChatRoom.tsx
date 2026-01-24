import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // SỬA: Dùng react-router-dom
import { Input, Button, Avatar, Typography, Modal, message, Space, Badge } from "antd";
import {
    SendOutlined,
    CloseCircleOutlined,
    UserOutlined,
    RobotOutlined,
    LeftOutlined
} from "@ant-design/icons";
import { ChatMessage } from "@/utils/types/chat";
import { ChatService } from "@/api/chatApi";
import { getSocket } from "@/utils/socket";

const { Text, Title } = Typography;

export default function ChatRoomPage() {
    const params = useParams<string>();
    const sessionCode = params.sessionCode;
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [realId, setRealId] = useState<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const socket = getSocket();

    const SERVICE_AUTO_IMAGES: Record<string, string> = {
        "[Yêu cầu hỗ trợ: 🍽️ Order Food]": "https://insacmauviet.vn/Uploads/682.gif",
        "[Yêu cầu hỗ trợ: 🧹 Cleaning]": "https://hpmed.vn/Files/419/kinh-doanh-spa/Menu-spa-can-cung-cap-thong-tin-chinh-xac.jpg",
        "[Yêu cầu hỗ trợ: 🧺 Laundry]": "https://incaominh.com/wp-content/uploads/2024/04/mau-bang-gia-dich-vu-de-ban.jpg"
    };

    // Tự động cuộn xuống khi có tin nhắn mới
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages]);

    useEffect(() => {
        if (!sessionCode) return;

        socket.emit("staff_join");
        socket.emit("join_session", { sessionCode, clientIdentifier: "STAFF_DASHBOARD" });

        socket.on("session_joined", (payload) => {
            setMessages(payload.messages);
            setRealId(payload.sessionId);
        });

        socket.on("receive_message", (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);

            // Logic phản hồi ảnh tự động
            if (msg.sender === "CLIENT") {
                const autoImageUrl = SERVICE_AUTO_IMAGES[msg.originalText];
                if (autoImageUrl) {
                    socket.emit("send_message", {
                        sessionCode,
                        content: `IMAGE_URL:${autoImageUrl}`
                    });
                }
            }
        });

        return () => {
            socket.off("session_joined");
            socket.off("receive_message");
        };
    }, [sessionCode]);

    const sendMessage = () => {
        if (!input.trim() || !sessionCode) return;
        socket.emit("send_message", { sessionCode, content: input });
        setInput("");
    };

    const handleLeaveRoom = () => {
        navigate("/chat");
    };

    const handleCloseRoom = () => {
        if (!realId) return message.warning("Không tìm thấy ID phiên chat!");

        Modal.confirm({
            title: 'Kết thúc phiên hỗ trợ?',
            content: `Xác nhận đóng phiên chat ${sessionCode}.`,
            okText: 'Đóng phòng',
            okType: 'danger',
            onOk: async () => {
                try {
                    await ChatService.closeSession(realId);
                    socket.emit("send_message", {
                        sessionCode: sessionCode,
                        content: "[SYSTEM]: Phiên hỗ trợ đã kết thúc."
                    });
                    message.success("Đã đóng phòng.");
                    navigate("/chat");
                } catch (error) {
                    message.error("Lỗi khi đóng phòng!");
                }
            },
        });
    };

    return (
        <div style={{
            height: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            background: '#f5f5f5',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #e8e8e8'
        }}>
            {/* Header */}
            <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={12}>
                    <Button icon={<LeftOutlined />} type="text" onClick={handleLeaveRoom} />
                    <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                    <div>
                        <Title level={5} style={{ margin: 0 }}>Phòng: {sessionCode}</Title>
                        <Badge status="success" color="green" text="Đang trực tuyến" />
                    </div>
                </Space>
                <Space>
                    <Button onClick={handleLeaveRoom}>Thoát</Button>
                    <Button danger type="primary" onClick={handleCloseRoom}>Kết thúc hỗ trợ</Button>
                </Space>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map((m, idx) => {
                    const isStaff = m.sender === "STAFF" || m.sender === "BOT";
                    const isImage = m.originalText?.startsWith("IMAGE_URL:");
                    const imageUrl = isImage ? m.originalText.replace("IMAGE_URL:", "") : "";

                    return (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: isStaff ? 'flex-end' : 'flex-start',
                            width: '100%'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: isStaff ? 'row-reverse' : 'row',
                                gap: '10px',
                                maxWidth: '70%'
                            }}>
                                <Avatar
                                    icon={isStaff ? <RobotOutlined /> : <UserOutlined />}
                                    style={{ backgroundColor: isStaff ? '#1677ff' : '#8c8c8c', flexShrink: 0 }}
                                />
                                <div style={{ textAlign: isStaff ? 'right' : 'left' }}>
                                    <div style={{
                                        padding: '10px 16px',
                                        borderRadius: '12px',
                                        background: isStaff ? '#1677ff' : '#fff',
                                        color: isStaff ? '#fff' : '#000',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        border: isStaff ? 'none' : '1px solid #e8e8e8'
                                    }}>
                                        {isImage ? (
                                            <img src={imageUrl} alt="service" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                                        ) : (
                                            <>
                                                <div style={{ fontWeight: 500 }}>{m.originalText}</div>
                                                {m.translatedText && (
                                                    <div style={{ fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 4, paddingTop: 4, fontStyle: 'italic' }}>
                                                        Dịch: {m.translatedText}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: '10px' }}>
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Footer */}
            <div style={{ padding: '20px 24px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        placeholder="Nhập tin nhắn..."
                        size="large"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onPressEnter={sendMessage}
                    />
                    <Button type="primary" size="large" icon={<SendOutlined />} onClick={sendMessage} />
                </Space.Compact>
            </div>
        </div>
    );
}