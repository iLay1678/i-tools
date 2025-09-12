"use client";

import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Button,
  Avatar,
  Badge,
  Flex,
} from "antd";
import {
  QrcodeOutlined,
  CloudDownloadOutlined,
  CarOutlined,
  RightOutlined,
  CodeOutlined,
  CloudOutlined,
  CustomerServiceOutlined,
  ToolOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useState } from "react";

const { Title, Text } = Typography;

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  status: "available" | "coming-soon";
  category: string;
  tags: string[];
  color: string;
}

const tools: Tool[] = [
  {
    id: "text-formatter",
    title: "文字格式化工具",
    description:
      "快速清理复制文本的格式、空格和换行符，去除多余的格式信息，还原纯净的文字内容，适用于处理从Word、PDF或网页复制的文本",
    icon: <ScissorOutlined />,
    href: "/text-formatter",
    status: "available",
    category: "encoding",
    tags: ["文字格式化", "去格式", "文本清理", "去空格"],
    color: "#eb2f96",
  },
  {
    id: "random-string",
    title: "随机字符串生成器",
    description:
      "生成安全可靠的随机字符串，支持多种字符集配置、批量生成和强度评估，适用于密码生成、API密钥创建等场景",
    icon: <ThunderboltOutlined />,
    href: "/random-string",
    status: "available",
    category: "encoding",
    tags: ["随机字符串", "密码生成", "安全"],
    color: "#722ed1",
  },
  {
    id: "qrcode",
    title: "二维码生成器",
    description:
      "快速生成各种类型的二维码，支持文本、链接、WiFi等多种格式，提供高清下载和自定义样式",
    icon: <QrcodeOutlined />,
    href: "/qrcode",
    status: "available",
    category: "encoding",
    tags: ["二维码", "QR Code", "生成器"],
    color: "#10b981",
  },
  {
    id: "json-formatter",
    title: "JSON格式化工具",
    description:
      "强大的JSON格式化和压缩工具，支持JSON美化、压缩、验证和语法高亮，让JSON数据处理更简单",
    icon: <CodeOutlined />,
    href: "/json-formatter",
    status: "available",
    category: "encoding",
    tags: ["JSON", "格式化", "压缩", "验证"],
    color: "#8b5cf6",
  },
  {
    id: "alipan-tv-token",
    title: "阿里云盘TV Token",
    description:
      "获取阿里云盘TV版授权Token，轻松在电视端使用阿里云盘，支持扫码登录和Token管理",
    icon: <CloudDownloadOutlined />,
    href: "/alipan-tv-token",
    status: "available",
    category: "storage",
    tags: ["阿里云盘", "TV版", "Token"],
    color: "#14b8a6",
  },
  {
    id: "move-car",
    title: "挪车码牌生成器",
    description:
      "生成专属挪车码牌，支持微信小程序推送通知，让挪车变得更加便捷高效",
    icon: <CarOutlined />,
    href: "/move-car",
    status: "available",
    category: "lifestyle",
    tags: ["挪车", "码牌", "微信推送"],
    color: "#f59e0b",
  },
];

// 分类配置
const categoryConfig: Record<
  string,
  { icon: React.ReactNode; color: string; description: string; name: string }
> = {
  encoding: {
    icon: <CodeOutlined />,
    color: "#10b981",
    description: "编码解码相关的实用工具",
    name: "编码工具",
  },
  storage: {
    icon: <CloudOutlined />,
    color: "#14b8a6",
    description: "云存储平台相关工具",
    name: "云存储",
  },
  lifestyle: {
    icon: <CustomerServiceOutlined />,
    color: "#f59e0b",
    description: "日常生活便民服务工具",
    name: "生活服务",
  },
};

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 筛选工具
  const filteredTools = selectedCategory 
    ? tools.filter(tool => tool.category === selectedCategory)
    : tools;

  // 获取所有分类
  const categories = Array.from(new Set(tools.map(tool => tool.category)));

  return (
    <div className="homepage-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      {/* 顶部标题区域 */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <Title
          level={1}
          className="gradient-text"
          style={{ 
            fontSize: "2.5em", 
            marginBottom: 16,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          🛠️ 爱拓工具箱
        </Title>
        <Text 
          style={{ 
            fontSize: "18px", 
            color: "#6b7280",
            display: "block",
            marginBottom: 24 
          }}
        >
          精心收集和开发的实用在线工具集合，让您的工作和生活更加便捷高效
        </Text>
        {/* <Tag 
          color="blue" 
          style={{ 
            fontSize: "14px", 
            padding: "6px 16px",
            borderRadius: "20px",
            border: "none"
          }}
        >
          {tools.length} 个精选工具
        </Tag> */}
      </div>

      {/* 分类筛选 */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Title level={4} style={{ marginBottom: 16, color: "#374151" }}>
          🏷️ 按分类筛选
        </Title>
        <Space wrap size="middle">
          <Tag
            color={selectedCategory === null ? "blue" : "default"}
            style={{
              cursor: "pointer",
              fontSize: "14px",
              padding: "6px 16px",
              borderRadius: "20px",
              border: selectedCategory === null ? "2px solid #1890ff" : "1px solid #d9d9d9",
              fontWeight: selectedCategory === null ? 600 : 400,
            }}
            onClick={() => setSelectedCategory(null)}
          >
            <AppstoreOutlined style={{ marginRight: 4 }} />
            全部工具
          </Tag>
          {categories.map((category) => (
            <Tag
              key={category}
              color={selectedCategory === category ? "blue" : "default"}
              style={{
                cursor: "pointer",
                fontSize: "14px",
                padding: "6px 16px",
                borderRadius: "20px",
                border: selectedCategory === category ? "2px solid #1890ff" : "1px solid #d9d9d9",
                fontWeight: selectedCategory === category ? 600 : 400,
              }}
              onClick={() => setSelectedCategory(category)}
            >
              {categoryConfig[category]?.icon && (
                <span style={{ marginRight: 4 }}>
                  {categoryConfig[category].icon}
                </span>
              )}
              {categoryConfig[category]?.name || category}
            </Tag>
          ))}
        </Space>
        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            当前显示 {filteredTools.length} 个工具
            {selectedCategory && ` · ${categoryConfig[selectedCategory]?.name || selectedCategory}`}
          </Text>
        </div>
      </div>

      {/* 工具展示区域 */}
      <div className="tools-section">
        <Row gutter={[24, 24]} justify="start">
          {filteredTools.map((tool) => (
            <Col key={tool.id} xs={24} sm={12} lg={8} xl={6}>
              <Link href={tool.href} style={{ textDecoration: "none" }}>
                <Card
                  hoverable={tool.status === "available"}
                  style={{
                    height: "300px",
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  styles={{ 
                    body: {
                      padding: "24px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column"
                    }
                  }}
                >
                  {/* 工具头部 */}
                  <div style={{ marginBottom: 16 }}>
                    <Flex align="center" gap="large" style={{ marginBottom: 12 }}>
                      <Avatar
                        size={44}
                        icon={tool.icon}
                        style={{
                          backgroundColor: tool.color,
                          fontSize: "20px",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <Title
                          level={5}
                          style={{ 
                            margin: 0, 
                            fontSize: "16px",
                            fontWeight: 600,
                            lineHeight: 1.3
                          }}
                        >
                          {tool.title}
                        </Title>
                      </div>
                    </Flex>
                    
                    {/* 分类标签 */}
                    <div style={{ marginBottom: 8 }}>
                      <Tag
                        style={{
                          borderRadius: 8,
                          fontSize: "11px",
                          border: "none",
                          backgroundColor: `${tool.color}15`,
                          color: tool.color,
                          margin: 0
                        }}
                      >
                        {categoryConfig[tool.category]?.name || tool.category}
                      </Tag>
                      {tool.status === "coming-soon" && (
                        <Tag color="orange" style={{ marginLeft: 6, fontSize: "11px" }}>
                          敬请期待
                        </Tag>
                      )}
                    </div>
                  </div>

                  {/* 工具描述 */}
                  <div style={{ height: "78px", marginBottom: 16, overflow: "hidden" }}>
                    <Text
                      style={{ 
                        fontSize: "13px", 
                        lineHeight: "1.5",
                        color: "#666",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {tool.description}
                    </Text>
                  </div>

                  {/* 标签 */}
                  <div style={{ height: "28px", marginBottom: 16, overflow: "hidden" }}>
                    <Space wrap size="small">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <Tag
                          key={tag}
                          style={{
                            borderRadius: 6,
                            fontSize: "10px",
                            border: "none",
                            backgroundColor: "#f5f5f5",
                            color: "#666",
                            margin: 0,
                            padding: "2px 6px"
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </Space>
                  </div>

                  {/* 统一的操作按钮 */}
                  <div style={{ marginTop: "auto" }}>
                    <Button
                      type={tool.status === "available" ? "primary" : "default"}
                      block
                      size="middle"
                      icon={tool.status === "available" ? <RightOutlined /> : null}
                      disabled={tool.status === "coming-soon"}
                      style={{
                        borderRadius: 8,
                        height: 42,
                        background: tool.status === "available" ? tool.color : "#f5f5f5",
                        borderColor: tool.status === "available" ? tool.color : "#d9d9d9",
                        color: tool.status === "available" ? "#fff" : "#999",
                        fontWeight: 500,
                        fontSize: "14px"
                      }}
                    >
                      {tool.status === "available" ? "立即使用" : "敬请期待"}
                    </Button>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        {/* 无结果提示 */}
        {filteredTools.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Text type="secondary" style={{ fontSize: "16px" }}>
              暂无该分类下的工具
            </Text>
          </div>
        )}
      </div>

      {/* 分类说明 */}
      <div style={{ marginTop: 48, marginBottom: 32 }}>
        <Title level={4} style={{ textAlign: "center", marginBottom: 24 }}>
          📋 工具分类介绍
        </Title>
        <Row gutter={[16, 16]} justify="center">
          {Object.entries(categoryConfig).map(([category, config]) => (
            <Col key={category} xs={24} sm={8}>
              <Card
                hoverable
                onClick={() => setSelectedCategory(category)}
                style={{
                  textAlign: "center",
                  borderRadius: 8,
                  border: `1px solid ${config.color}20`,
                  backgroundColor: `${config.color}08`,
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                <Avatar
                  size={32}
                  icon={config.icon}
                  style={{
                    backgroundColor: config.color,
                    marginBottom: 8
                  }}
                />
                <Title level={5} style={{ margin: 0, fontSize: "14px" }}>
                  {categoryConfig[category]?.name || category}
                </Title>
                <Text style={{ fontSize: "12px", color: "#666" }}>
                  {config.description}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 底部说明 */}
      <Card
        style={{
          marginTop: 32,
          borderRadius: 12,
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          border: "1px solid #e2e8f0",
          textAlign: "center"
        }}
        styles={{ body: { padding: "32px" } }}
      >
        <Title level={4} style={{ color: "#4b5563", marginBottom: 12 }}>
          💡 更多工具正在开发中
        </Title>
        <Text style={{ color: "#6b7280", fontSize: "14px" }}>
          我们持续为您带来更多实用工具，让您的工作和生活更加便捷。
          如果您有好的建议或需求，欢迎联系我们。
        </Text>
      </Card>
    </div>
  );
}
