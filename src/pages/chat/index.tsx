import React, { useEffect, useState } from "react";
import {
    Card, Tag, Typography, Badge, Button, Spin,
    Row, Col, Space, Statistic, Divider, Avatar, Tooltip
} from "antd";
import {
    ArrowRightOutlined,
    GlobalOutlined,
    CustomerServiceOutlined,
    UserOutlined,
    CalendarOutlined,
    CrownOutlined,
    InfoCircleOutlined,
    SketchOutlined,
    SafetyCertificateOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ChatSession } from "@/utils/types/chat";
import { ChatService } from "@/api/chatApi";

const { Title, Text } = Typography;

const getMembershipColor = (level: string) => {
    switch (level?.toUpperCase()) {
        case 'DIAMOND':
            return {
                color: '#722ed1',
                bg: '#f9f0ff',
                border: '#d3adf7',
                icon: <SketchOutlined />
            };
        case 'PLATINUM':
            return {
                color: '#13c2c2',
                bg: '#e6fffb',
                border: '#87e8de',
                icon: <SafetyCertificateOutlined />
            };
        case 'GOLD':
            return {
                color: '#d48806',
                bg: '#fffbe6',
                border: '#ffe58f',
                icon: <CrownOutlined />
            };
        case 'SILVER':
            return {
                color: '#595959',
                bg: '#f5f5f5',
                border: '#d9d9d9',
                icon: <UserOutlined />
            };
        default:
            return {
                color: '#0958d9',
                bg: '#e6f4ff',
                border: '#91caff',
                icon: <UserOutlined />
            };
    }
};

const getBookingTag = (status: string) => {
    switch (status) {
        case 'ACTIVE': return <Tag color="success">ĐANG Ở (ACTIVE)</Tag>;
        case 'PAST': return <Tag color="default">ĐÃ TRẢ PHÒNG (PAST)</Tag>;
        case 'CANCELLED': return <Tag color="error">ĐÃ HỦY (CANCELLED)</Tag>;
        default: return <Tag color="warning">CHƯA CÓ ĐẶT PHÒNG</Tag>;
    }
};

export default function ChatSessionPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const load = async () => {
        try {
            const data = await ChatService.getOpenSessions();
            await ChatService.getOpenSessions();
            setSessions(data);
        } catch (error) {
            console.error("Error: ", error);
        } finally {
            setLoading(false);
        }
    };

    const cleanSession = async () => {
        try {
            await ChatService.cleanSession();
        } catch (error) {
            console.error("Error: ", error);
        } finally {
        }
    };

    useEffect(() => {
        cleanSession();
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 20000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Space direction="vertical" align="center">
                    <Spin size="large" />
                    <Text type="secondary">Đang tải danh sách điều phối...</Text>
                </Space>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
            {/* Header Section */}
            <Card style={{ marginBottom: 24, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space size={16}>
                            <Avatar size={54} icon={<CustomerServiceOutlined />} style={{ backgroundColor: '#1677ff' }} />
                            <div>
                                <Title level={2} style={{ margin: 0 }}>Trung tâm Điều phối</Title>
                                <Text type="secondary">Phân loại và hỗ trợ khách hàng theo thứ tự ưu tiên</Text>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Statistic
                            title="Yêu cầu chờ xử lý"
                            value={sessions.length}
                            valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                        />
                    </Col>
                </Row>
            </Card>

            <Row gutter={[20, 20]}>
                {sessions.map((s) => {
                    const memberTheme = getMembershipColor(s.membershipLevel || "");
                    return (
                        <Col key={s.id} xs={24} sm={12} lg={8} xl={6}>
                            <Card
                                hoverable
                                style={{ borderRadius: '16px', borderTop: `4px solid ${memberTheme.color}` }}
                                bodyStyle={{ padding: '20px' }}
                                actions={[
                                    <Button
                                        type="primary"
                                        block
                                        icon={<ArrowRightOutlined />}
                                        onClick={() => navigate(`/chat/${s.sessionCode}`, { state: { session: s } })}
                                        style={{ width: '90%', borderRadius: '8px' }}
                                    >
                                        VÀO HỖ TRỢ
                                    </Button>
                                ]}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <Space direction="vertical" size={0}>
                                        <Text strong style={{ fontSize: '16px', display: 'block' }}>
                                            {s.customerName || s.customerEmail || "Khách vãng lai"}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>#{s.bookingCode || 'N/A'}</Text>
                                    </Space>
                                    <Tooltip title={`Hạng thành viên: ${s.membershipLevel || 'MEMBER'}`}>
                                        <Tag color={memberTheme.color} style={{ margin: 0, borderRadius: '10px' }}>
                                            {memberTheme.icon} {s.membershipLevel}
                                        </Tag>
                                    </Tooltip>
                                </div>

                                <Space direction="vertical" style={{ width: '100%' }} size={10}>
                                    <div style={{ background: '#f8f9fa', padding: '8px 12px', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <Text type="secondary"><CalendarOutlined /> Booking:</Text>
                                            {getBookingTag(s.bookingStatus)}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text type="secondary"><GlobalOutlined /> Ngôn ngữ:</Text>
                                            <Tag color="geekblue" style={{ margin: 0 }}>{s.clientLang?.toUpperCase() || 'EN'}</Tag>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            <InfoCircleOutlined /> Cập nhật: {new Date(s.lastMessageAt || s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                        <Badge status="processing" text="Online" />
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
}