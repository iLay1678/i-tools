"use client";

import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Space,
  QRCode,
  Switch,
  Select,
  Row,
  Col,
  Typography,
  Button,
  Flex,
  Divider,
  App,
} from "antd";
import { 
  DownloadOutlined, 
  CopyOutlined, 
  SettingOutlined,
  EyeOutlined,
  SaveOutlined,
  RocketOutlined,
  BulbOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import Head from "next/head";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

interface QRConfig {
  size: number;
  icon: string;
  iconSize: number;
  color: string;
  bgColor: string;
  bordered: boolean;
  errorLevel: "L" | "M" | "Q" | "H";
}

export default function QRCodeGenerator() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [text, setText] = useState("");
  const [config, setConfig] = useState<QRConfig>({
    size: 160,
    icon: "",
    iconSize: 40,
    color: "#000000",
    bgColor: "transparent",
    bordered: true,
    errorLevel: "M",
  });

  const handleConfigChange = (field: keyof QRConfig, value: string | number | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const downloadQRCode = () => {
    // 等待一小段时间确保canvas完全渲染
    setTimeout(() => {
      const canvas = document.querySelector(
        "#qr-code-container canvas",
      ) as HTMLCanvasElement;
      if (canvas) {
        try {
          const link = document.createElement("a");
          link.download = "qrcode.png";
          link.href = canvas.toDataURL("image/png", 1.0);
          link.click();
          message?.success("二维码下载成功");
        } catch (error) {
          message?.error("下载失败");
        }
      } else {
        message?.error("未找到二维码");
      }
    }, 100);
  };

  const copyToClipboard = () => {
    // 等待更长时间确保canvas完全渲染
    setTimeout(() => {
      const canvas = document.querySelector(
        "#qr-code-container canvas",
      ) as HTMLCanvasElement;
      
      if (canvas) {
        // 直接使用canvas.toBlob方法
        canvas.toBlob(
          (blob) => {
            if (blob) {
              navigator.clipboard
                .write([new ClipboardItem({ "image/png": blob })])
                .then(() => {
                  message?.success("二维码已复制到剪贴板");
                })
                .catch(() => {
                  message?.error("复制失败");
                });
            } else {
              message?.error("生成图片失败");
            }
          },
          "image/png",
          1.0,
        );
      } else {
        message?.error("未找到二维码");
      }
    }, 800); // 增加到800ms等待时间
  };
  return (
    <>
      <Head>
        <title>二维码生成器 - 爱拓工具箱</title>
      </Head>
      
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* 页面标题 */}
        <Card>
          <Flex vertical align="center" gap="small">
            <Typography.Title level={1} className="gradient-text" style={{ margin: 0 }}>
              📱 二维码生成器
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 16, textAlign: "center" }}>
              快速生成自定义二维码，支持多种样式配置
            </Typography.Text>
          </Flex>
        </Card>

        {/* 主功能区域 */}
        <Form form={form} layout="vertical">
          <Row gutter={[24, 24]}>
            {/* 左侧配置区域 */}
            <Col xs={24} lg={12}>
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* 内容设置 */}
                <Card 
                  title={
                    <Space>
                      <span>📝</span>
                      <span>内容设置</span>
                    </Space>
                  } 
                  size="small"
                >
                  <Form.Item
                    name="text"
                    rules={[
                      {
                        required: true,
                        message: "请输入要生成二维码的文本内容",
                      },
                    ]}
                  >
                    <Input.TextArea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={5}
                      showCount
                      placeholder="请输入要生成二维码的文本内容，如：网址、文本、微信号等..."
                      maxLength={2953}
                    />
                  </Form.Item>
                </Card>

                {/* 样式配置 */}
                <Card 
                  title={
                    <Space>
                      <SettingOutlined />
                      <span>样式配置</span>
                    </Space>
                  } 
                  size="small"
                >
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="二维码大小">
                          <Input
                            type="number"
                            value={config.size}
                            onChange={(e) =>
                              handleConfigChange(
                                "size",
                                parseInt(e.target.value) || 160,
                              )
                            }
                            addonAfter="px"
                            min={40}
                            max={500}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="图标大小">
                          <Input
                            type="number"
                            value={config.iconSize}
                            onChange={(e) =>
                              handleConfigChange(
                                "iconSize",
                                parseInt(e.target.value) || 40,
                              )
                            }
                            addonAfter="px"
                            min={20}
                            max={200}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item label="中心图标地址">
                      <Input
                        value={config.icon}
                        onChange={(e) => handleConfigChange("icon", e.target.value)}
                        placeholder="图标URL（可选）"
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="二维码颜色">
                          <Input
                            type="color"
                            value={config.color}
                            onChange={(e) => handleConfigChange("color", e.target.value)}
                            placeholder="#000000"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="背景颜色">
                          <Input
                            type="color"
                            value={
                              config.bgColor === "transparent"
                                ? "#ffffff"
                                : config.bgColor
                            }
                            onChange={(e) => handleConfigChange("bgColor", e.target.value)}
                            placeholder="背景颜色"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="纠错等级">
                          <Select
                            value={config.errorLevel}
                            onChange={(value) => handleConfigChange("errorLevel", value)}
                          >
                            <Select.Option value="L">L - 低 (7%)</Select.Option>
                            <Select.Option value="M">M - 中 (15%)</Select.Option>
                            <Select.Option value="Q">Q - 较高 (25%)</Select.Option>
                            <Select.Option value="H">H - 高 (30%)</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="显示边框">
                          <Switch
                            checked={config.bordered}
                            onChange={(checked) => handleConfigChange("bordered", checked)}
                            checkedChildren="显示"
                            unCheckedChildren="隐藏"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Space>
            </Col>

            {/* 右侧预览区域 */}
            <Col xs={24} lg={12}>
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* 实时预览 */}
                <Card 
                  title={
                    <Space>
                      <EyeOutlined />
                      <span>实时预览</span>
                    </Space>
                  } 
                  size="small"
                >
                  <Flex vertical align="center" justify="center" style={{ minHeight: 300, background: "#f8f9fa", borderRadius: 8, padding: 32 }}>
                    {text ? (
                      <Space direction="vertical" align="center">
                        <div id="qr-code-container">
                          <QRCode
                            value={text}
                            icon={config.icon || undefined}
                            size={config.size}
                            iconSize={config.iconSize}
                            color={config.color}
                            bgColor={config.bgColor}
                            bordered={config.bordered}
                            errorLevel={config.errorLevel}
                          />
                        </div>
                        <Typography.Text type="secondary">
                          大小: {config.size}×{config.size}px
                        </Typography.Text>
                      </Space>
                    ) : (
                      <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                        请在左侧输入内容后查看预览
                      </Typography.Text>
                    )}
                  </Flex>
                </Card>

                {/* 下载选项 */}
                {text && (
                  <Card 
                    title={
                      <Space>
                        <SaveOutlined />
                        <span>下载选项</span>
                      </Space>
                    } 
                    size="small"
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Button
                        type="primary"
                        block
                        icon={<DownloadOutlined />}
                        onClick={downloadQRCode}
                        size="large"
                      >
                        下载为 PNG
                      </Button>
                      {/* <Button
                        block
                        icon={<CopyOutlined />}
                        onClick={copyToClipboard}
                        size="large"
                      >
                        复制到剪贴板
                      </Button> */}
                    </Space>
                  </Card>
                )}
              </Space>
            </Col>
          </Row>
        </Form>

        {/* 使用说明 */}
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
                  <li>支持文本、网址、联系信息等多种内容类型</li>
                  <li>自定义二维码颜色和背景色</li>
                  <li>支持中心图标，增强品牌识别度</li>
                  <li>多种纠错等级，适应不同使用场景</li>
                </ul>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                title={
                  <Space>
                    <BulbOutlined />
                    <span>使用技巧</span>
                  </Space>
                } 
                size="small"
              >
                <ul>
                  <li>纠错等级越高，二维码容错性越强，但密度也越大</li>
                  <li>中心图标建议使用正方形，且不宜过大</li>
                  <li>深色二维码配浅色背景，扫描效果更佳</li>
                </ul>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                title={
                  <Space>
                    <MobileOutlined />
                    <span>应用场景</span>
                  </Space>
                } 
                size="small"
              >
                <ul>
                  <li>网站链接快速分享</li>
                  <li>联系方式信息传递</li>
                  <li>活动邀请码生成</li>
                  <li>产品信息展示</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </Card>
      </Space>
    </>
  );
}
