import React, { useEffect, useState } from "react";
import {
    Card, Tag, Typography, Badge, Button, Spin,
    Row, Col, Space, Statistic, Divider
} from "antd";
import {
    MessageOutlined,
    ArrowRightOutlined,
    GlobalOutlined,
    CustomerServiceOutlined,
    SyncOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ChatSession } from "@/utils/types/chat";
import { ChatService } from "@/api/chatApi";

const { Title, Text } = Typography;

export default function ChatSessionPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const load = async () => {
        try {
            const data = await ChatService.getOpenSessions();
            setSessions(data);
        } catch (error) {
            console.error("Error: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Space direction="vertical" align="center">
                    <Spin size="large" />
                    <Text type="secondary">Đang tải danh sách phòng chat...</Text>
                </Space>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', width: '100%', margin: '0 auto' }}>
            {/* Header Section */}
            <Card style={{ marginBottom: 24, borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Row justify="space-between" align="middle">
                    <Col xs={24} sm={16}>
                        <Space size={16}>
                            <div style={{
                                padding: '12px',
                                background: '#e6f4ff',
                                borderRadius: '12px',
                                color: '#1677ff',
                                fontSize: '24px'
                            }}>
                                <CustomerServiceOutlined />
                            </div>
                            <div>
                                <Title level={3} style={{ margin: 0 }}>Trung tâm Điều phối Chat</Title>
                                <Text type="secondary">Quản lý và hỗ trợ khách hàng theo thời gian thực</Text>
                            </div>
                        </Space>
                    </Col>
                    <Col xs={24} sm={8} style={{ textAlign: 'right', marginTop: '16px' }}>
                        <Statistic
                            title="Phòng đang hoạt động"
                            value={sessions.length}
                            prefix={<Badge status="processing" color="#52c41a" />}
                            valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Session Grid */}
            <Row gutter={[20, 20]} justify="start">
                {sessions.length === 0 ? (
                    <Col span={24}>
                        <Card style={{ textAlign: 'center', padding: '40px', borderRadius: '12px' }}>
                            <MessageOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                            <br />
                            <Text type="secondary">Hiện tại không có yêu cầu hỗ trợ nào.</Text>
                        </Card>
                    </Col>
                ) : (
                    sessions.map((s) => (
                        <Col
                            key={s.id}
                            xs={24}   
                            sm={12}    
                            md={12}    
                            lg={8}     
                            xl={8}     
                            xxl={6}    
                        >
                            <Card
                                hoverable
                                style={{ borderRadius: '12px', overflow: 'hidden' , width: '100%', minWidth: '300px'}}
                                bodyStyle={{ padding: '20px' }}
                                actions={[
                                    <Button
                                        type="link"
                                        icon={<ArrowRightOutlined />}
                                        onClick={() => navigate(`/chat/${s.sessionCode}`)}
                                        style={{ fontWeight: 600 }}
                                    >
                                        VÀO HỖ TRỢ
                                    </Button>
                                ]}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Tag color="blue" style={{ borderRadius: '4px', margin: 0 }}>
                                        #{s.sessionCode.split('_')[1] || s.sessionCode}
                                    </Tag>
                                    <Badge status="success" text={<Text type="secondary" style={{ fontSize: '12px' }}>Live</Text>} />
                                </div>

                                <Title level={5} style={{ marginBottom: 16 }}>
                                    Khách hàng: {s.sessionCode.startsWith("ROOM") ? `Phòng ${s.sessionCode.split('_')[1]}` : "Khách vãng lai"}
                                </Title>

                                <Divider style={{ margin: '12px 0' }} />

                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <GlobalOutlined style={{ color: '#8c8c8c' }} />
                                        <Text type="secondary">Ngôn ngữ:</Text>
                                        <Tag color="geekblue" style={{ border: 'none' }}>
                                            {s.clientLang?.toUpperCase() || "EN"}
                                        </Tag>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <SyncOutlined spin style={{ color: '#52c41a' }} />
                                        <Text type="secondary">Trạng thái: Đang chờ</Text>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </div>
    );
}