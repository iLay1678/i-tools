"use client";

import { useState } from "react";
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Checkbox, 
  Row, 
  Col, 
  Typography, 
  QRCode, 
  message, 
  Space,
  Alert,
  Tooltip,
  Flex,
} from "antd";
import { 
  CarOutlined, 
  PhoneOutlined, 
  WechatOutlined, 
  QrcodeOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  BulbOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import Head from "next/head";

const { Title, Paragraph, Text, Link } = Typography;

interface FormData {
  plateNumber: string
  phoneNumber: string
  token?: string
  uid?: string
  newEnergy: boolean
}

export default function MoveCar() {
  const [form] = Form.useForm();
  const [generatedUrl, setGeneratedUrl] = useState("");

  const handleSubmit = (values: FormData) => {
    const url = new URL(window.location.href + "/display");
    url.searchParams.append("plateNumber", values.plateNumber);
    url.searchParams.append("phoneNumber", values.phoneNumber);
    if (values.token) url.searchParams.append("token", values.token);
    if (values.uid) url.searchParams.append("uid", values.uid);
    if (values.newEnergy) url.searchParams.append("new", "true");
    setGeneratedUrl(url.toString());
  };

  const handleSubmitFailed = () => {
    message.warning("请填写完整信息");
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    message.success("链接已复制到剪贴板");
  };
  return (
    <>
      <Head>
        <title>挪车码牌生成器 - 爱拓工具箱</title>
      </Head>
      
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* 页面标题 */}
        <Card>
          <Flex vertical align="center" gap="small">
            <Typography.Title level={1} className="gradient-text" style={{ margin: 0 }}>
              <CarOutlined style={{ marginRight: 8 }} />
              挪车码牌生成器
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 16, textAlign: "center" }}>
              生成专属挪车码牌，让他人轻松联系您。支持微信推送通知功能。
            </Typography.Text>
          </Flex>
        </Card>

        {/* 主功能区域 */}
        <Row gutter={[24, 24]}>
          {/* 左侧表单区域 */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <CarOutlined />
                  <span>填写车辆信息</span>
                </Space>
              }
            >
              <Form
                form={form}
                onFinish={handleSubmit}
                onFinishFailed={handleSubmitFailed}
                layout="vertical"
                size="large"
              >
                {/* 基本信息区域 */}
                <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                  <Typography.Title level={4}>
                    <InfoCircleOutlined style={{ marginRight: 8, color: "#1677ff" }} />
                    基本信息
                  </Typography.Title>
                  
                  <Form.Item
                    name="plateNumber"
                    label="车牌号"
                    rules={[{ required: true, message: "请输入车牌号" }]}
                  >
                    <Input 
                      placeholder="如：京A12345" 
                      prefix={<CarOutlined />}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    name="phoneNumber"
                    label="联系电话"
                    rules={[
                      { required: true, message: "请输入联系电话" },
                      { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" },
                    ]}
                  >
                    <Input 
                      placeholder="如：13800138000" 
                      prefix={<PhoneOutlined />}
                    />
                  </Form.Item>
                  
                  <Form.Item name="newEnergy" valuePropName="checked">
                    <Checkbox>
                      <Space>
                        <span>🔋 新能源车辆</span>
                        <Tooltip title="勾选此项将在码牌上显示新能源标识">
                          <InfoCircleOutlined style={{ color: "#8c8c8c" }} />
                        </Tooltip>
                      </Space>
                    </Checkbox>
                  </Form.Item>

                  {/* 微信推送设置 */}
                  <Typography.Title level={4}>
                    <WechatOutlined style={{ marginRight: 8, color: "#1677ff" }} />
                    微信推送设置（可选）
                  </Typography.Title>
                  
                  <Alert
                    message="配置微信推送后，当有人扫码时您将收到通知"
                    type="info"
                    showIcon
                  />
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name="token" 
                        label={
                          <Space>
                            <span>Token</span>
                            <Tooltip title="WxPusher的应用Token">
                              <InfoCircleOutlined />
                            </Tooltip>
                          </Space>
                        }
                      >
                        <Input placeholder="应用Token" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="uid" 
                        label={
                          <Space>
                            <span>UID</span>
                            <Tooltip title="用户的UID">
                              <InfoCircleOutlined />
                            </Tooltip>
                          </Space>
                        }
                      >
                        <Input placeholder="用户UID" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Typography.Paragraph type="secondary">
                    需要微信推送？
                    <Typography.Link 
                      href="https://wxpusher.zjiecode.com/docs/#/" 
                      target="_blank"
                      style={{ marginLeft: 8 }}
                    >
                      查看配置文档 →
                    </Typography.Link>
                  </Typography.Paragraph>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      size="large"
                      block
                      icon={<QrcodeOutlined />}
                    >
                      生成挪车码牌
                    </Button>
                  </Form.Item>
                </Space>
              </Form>
            </Card>
          </Col>
          
          {/* 右侧预览区域 */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <QrcodeOutlined />
                  <span>{generatedUrl ? "生成成功" : "预览区域"}</span>
                </Space>
              }
            >
              {generatedUrl ? (
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                  <Alert
                    message="码牌生成成功！"
                    description="扫描二维码或点击链接查看码牌"
                    type="success"
                    showIcon
                  />
                  
                  <Flex vertical align="center" gap="middle" style={{ background: "#f9f9f9", borderRadius: 8, padding: 24 }}>
                    <QRCode 
                      value={generatedUrl} 
                      size={200}
                    />
                    <Typography.Text type="secondary">扫码查看码牌</Typography.Text>
                  </Flex>
                  
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Typography.Paragraph 
                      copyable={{ 
                        text: generatedUrl,
                        tooltips: ["复制链接", "复制成功!"],
                      }}
                    >
                      <Typography.Link 
                        href={generatedUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {generatedUrl.length > 50 ? 
                          `${generatedUrl.substring(0, 50)}...` : 
                          generatedUrl
                        }
                      </Typography.Link>
                    </Typography.Paragraph>
                    
                    <Button 
                      icon={<CopyOutlined />}
                      onClick={copyUrl}
                      size="large"
                      block
                    >
                      复制链接
                    </Button>
                  </Space>
                </Space>
              ) : (
                <Flex vertical align="center" justify="center" gap="middle" style={{ background: "#f5f5f5", borderRadius: 8, padding: 48, color: "#8c8c8c" }}>
                  <QrcodeOutlined style={{ fontSize: 48, opacity: 0.3 }} />
                  <Typography.Text type="secondary">
                    填写完信息后，二维码将在这里显示
                  </Typography.Text>
                </Flex>
              )}
            </Card>
          </Col>
        </Row>
        
        {/* 使用说明文档 */}
        <Card 
          title={
            <Space>
              <span>📖</span>
              <span>使用说明</span>
            </Space>
          }
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card 
                title={
                  <Space>
                    <RocketOutlined />
                    <span>功能特点</span>
                  </Space>
                } 
                size="small"
              >
                <ul>
                  <li>快速生成专属挪车码牌</li>
                  <li>支持新能源车辆标识</li>
                  <li>可选微信推送功能</li>
                  <li>移动端友好的码牌展示</li>
                </ul>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                title={
                  <Space>
                    <BulbOutlined />
                    <span>使用步骤</span>
                  </Space>
                } 
                size="small"
              >
                <ol>
                  <li>填写车牌号和联系电话</li>
                  <li>选择是否为新能源车辆</li>
                  <li>可选配置微信推送</li>
                  <li>点击生成按钮获取码牌</li>
                  <li>将二维码放置在车内</li>
                </ol>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                title={
                  <Space>
                    <MobileOutlined />
                    <span>微信推送配置</span>
                  </Space>
                } 
                size="small"
              >
                <ul>
                  <li>访问 WxPusher 官网注册应用</li>
                  <li>获取应用 Token 和用户 UID</li>
                  <li>关注微信公众号绑定账号</li>
                  <li>配置后可收到扫码通知</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </Card>
      </Space>
    </>
  );
}