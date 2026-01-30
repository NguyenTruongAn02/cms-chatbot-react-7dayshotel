import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Input, Button, Avatar, Typography, Modal, message, Space, Badge, Tag, Divider, Card, Row, Col, Image } from "antd";
import {
    SendOutlined,
    UserOutlined,
    RobotOutlined,
    LeftOutlined,
    CrownOutlined,
    CalendarOutlined,
    HomeOutlined,
    GlobalOutlined,
    SketchOutlined,
    TrophyOutlined,
    StarOutlined,
} from "@ant-design/icons";
import { ChatMessage, ChatSession } from "@/utils/types/chat";
import { ChatService } from "@/api/chatApi";
import { getSocket } from "@/utils/socket";

const { Text, Title } = Typography;

export default function ChatRoomPage() {
    const { sessionCode } = useParams() as { sessionCode?: string };
    const navigate = useNavigate();
    const location = useLocation();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const socket = getSocket();
    const initialSession = location.state?.session as ChatSession | null;

    const [sessionInfo, setSessionInfo] = useState<ChatSession | null>(initialSession);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        if (!sessionCode) return;

        socket.emit("staff_join");
        socket.emit("join_session", { sessionCode, clientIdentifier: "STAFF_DASHBOARD" });

        socket.on("session_joined", (payload: { messages: ChatMessage[], session: ChatSession }) => {
            setMessages(payload.messages);
        });

        socket.on("receive_message", (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off("session_joined");
            socket.off("receive_message");
        };
    }, [sessionCode, socket]);

    const sendMessage = () => {
        if (!input.trim() || !sessionCode) return;
        socket.emit("send_message", { sessionCode, content: input });
        setInput("");
    };

    // Hàm render nội dung tin nhắn (Check xem là Text hay Ảnh)
    const renderMessageContent = (text: string) => {
        if (text.startsWith("[IMG_URL]:")) {
            const url = text.replace("[IMG_URL]:", "").trim();
            return <Image src={url} width={200} style={{ borderRadius: '8px' }} placeholder={true} />;
        }
        return text;
    };

    const handleCloseRoom = () => {
        if (!sessionInfo?.id) return message.warning("Không tìm thấy ID phiên chat!");
        Modal.confirm({
            title: 'Kết thúc hỗ trợ?',
            content: `Xác nhận đóng phiên chat của khách ${sessionInfo?.customerName || sessionInfo?.customerEmail || sessionCode}.`,
            okText: 'Đóng phòng',
            okType: 'danger',
            onOk: async () => {
                try {
                    await ChatService.closeSession(sessionInfo.id);
                    socket.emit("send_message", { sessionCode, content: "[SYSTEM]: Phiên hỗ trợ đã kết thúc." });
                    navigate("/chat");
                } catch (error) {
                    message.error("Lỗi khi đóng phòng!");
                }
            },
        });
    };

    const renderMemberTag = () => {
        const level = sessionInfo?.membershipLevel?.toUpperCase();

        switch (level) {
            case 'DIAMOND':
                return (
                    <Tag color="purple" icon={<SketchOutlined />}>
                        DIAMOND
                    </Tag>
                );
            case 'PLATINUM':
                return (
                    <Tag color="cyan" icon={<TrophyOutlined />}>
                        PLATINUM
                    </Tag>
                );
            case 'GOLD':
                return (
                    <Tag color="gold" icon={<CrownOutlined />}>
                        GOLD
                    </Tag>
                );
            case 'SILVER':
                return (
                    <Tag color="silver" icon={<StarOutlined />}>
                        SILVER
                    </Tag>
                );
            default:
                return (
                    <Tag color="blue">
                        MEMBER
                    </Tag>
                );
        }
    };

    return (
        <Row gutter={[16, 16]} style={{ height: 'calc(100vh - 120px)', margin: 0 }}>

            <Col xs={24} lg={17} xl={18} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #e8e8e8',
                    height: '100%'
                }}>
                    {/* Header */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                            <Button icon={<LeftOutlined />} type="text" onClick={() => navigate("/chat")} />
                            <Avatar size="small" style={{ backgroundColor: sessionInfo?.membershipLevel === 'GOLD' ? '#faad14' : '#1677ff' }} icon={<UserOutlined />} />
                            <div>
                                <Text strong style={{ fontSize: '14px', display: 'block', lineHeight: '1.2' }}>
                                    {sessionInfo?.customerName || sessionInfo?.customerEmail || "Khách vãng lai"}
                                </Text>
                                <Badge status="success" text={<Text style={{ fontSize: '10px' }} type="secondary">Online</Text>} />
                            </div>
                        </Space>
                        <Button size="small" danger onClick={handleCloseRoom}>Kết thúc</Button>
                    </div>

                    {/* Body */}
                    <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messages.map((m, idx) => {
                            const isStaff = m.sender === "STAFF" || m.sender === "BOT";
                            return (
                                <div key={idx} style={{ alignSelf: isStaff ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                    <div style={{
                                        padding: '8px 12px',
                                        borderRadius: '12px',
                                        background: isStaff ? '#1677ff' : '#fff',
                                        color: isStaff ? '#fff' : '#000',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        border: isStaff ? 'none' : '1px solid #eee'
                                    }}>
                                        <div>{renderMessageContent(m.originalText)}</div>
                                        {m.translatedText && (
                                            <div style={{ fontSize: '11px', opacity: 0.8, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 4 }}>
                                                <i>{m.translatedText}</i>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <div style={{ padding: '12px 16px', background: '#fff' }}>
                        <Space.Compact style={{ width: '100%' }}>
                            <Input
                                placeholder="Nhập tin nhắn..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onPressEnter={sendMessage}
                            />
                            <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} />
                        </Space.Compact>
                    </div>
                </div>
            </Col>

            <Col xs={24} lg={7} xl={6} style={{ height: '100%', overflowY: 'auto' }}>
                <Card title="Thông tin khách hàng" bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                        <div style={{ textAlign: 'center' }}>
                            <Avatar size={48} icon={<UserOutlined />} style={{ backgroundColor: '#f0f0f0', color: '#bfbfbf' }} />
                            <Title level={5} style={{ margin: '8px 0 4px' }}>{sessionInfo?.customerName || sessionInfo?.customerEmail || "Khách vãng lai"}</Title>
                            {renderMemberTag()}
                        </div>

                        <Divider style={{ margin: '4px 0' }} />

                        <Row gutter={[8, 8]}>
                            <Col span={12}>
                                <Text type="secondary" style={{ fontSize: '12px' }}><CalendarOutlined /> Booking</Text>
                                <div>{sessionInfo?.bookingStatus === 'ACTIVE' ? <Tag color="success" style={{ margin: 0 }}>ACTIVE</Tag> : <Tag style={{ margin: 0 }}>{sessionInfo?.bookingStatus || 'NONE'}</Tag>}</div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary" style={{ fontSize: '12px' }}><HomeOutlined /> Room/Code</Text>
                                <div style={{ fontWeight: 'bold' }}>{sessionInfo?.bookingCode || "N/A"}</div>
                            </Col>
                            <Col span={24} style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}><GlobalOutlined /> Ngôn ngữ</Text>
                                <div><Tag color="geekblue">{sessionInfo?.clientLang?.toUpperCase() || "EN"}</Tag></div>
                            </Col>
                        </Row>

                        <div style={{ background: '#fff7e6', padding: '10px', borderRadius: '8px', border: '1px solid #ffe7ba', marginTop: 8 }}>
                            <Text strong style={{ color: '#d46b08', fontSize: '12px' }}>Ghi chú:</Text>
                            <p style={{ fontSize: '11px', margin: 0 }}>
                                Khách hạng {sessionInfo?.membershipLevel || 'MEMBER'}.
                            </p>
                        </div>
                    </Space>
                </Card>
            </Col>
        </Row>
    );
}