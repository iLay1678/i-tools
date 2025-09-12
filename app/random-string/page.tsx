"use client";

import { useState, useCallback } from "react";
import {
  Card,
  Form,
  Input,
  Space,
  Switch,
  Row,
  Col,
  Typography,
  Button,
  Flex,
  InputNumber,
  Checkbox,
  App,
  Tag,
  Alert,
  Statistic,
  Divider,
} from "antd";
import { 
  CopyOutlined, 
  SettingOutlined,
  EyeOutlined,
  ReloadOutlined,
  BulbOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import Head from "next/head";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface StringConfig {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
  customChars: string;
  batchCount: number;
}

const defaultConfig: StringConfig = {
  length: 12,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
  excludeSimilar: false,
  customChars: "",
  batchCount: 1,
};

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const SIMILAR_CHARS = "0O1lI|";

export default function RandomStringGenerator() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [config, setConfig] = useState<StringConfig>(defaultConfig);
  const [generatedStrings, setGeneratedStrings] = useState<string[]>([]);
  const [currentString, setCurrentString] = useState("");

  const handleConfigChange = (field: keyof StringConfig, value: string | number | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const getCharacterSet = useCallback(() => {
    let chars = "";
    
    if (config.customChars) {
      chars = config.customChars;
    } else {
      if (config.includeUppercase) chars += UPPERCASE;
      if (config.includeLowercase) chars += LOWERCASE;
      if (config.includeNumbers) chars += NUMBERS;
      if (config.includeSymbols) chars += SYMBOLS;
    }

    if (config.excludeSimilar && !config.customChars) {
      chars = chars.split("").filter(char => !SIMILAR_CHARS.includes(char)).join("");
    }

    return chars;
  }, [config]);

  const generateRandomString = useCallback((length: number, charset: string) => {
    if (!charset) return "";
    
    let result = "";
    const charactersLength = charset.length;
    
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  }, []);

  const generateStrings = useCallback(() => {
    const charset = getCharacterSet();
    
    if (!charset) {
      message.error("请至少选择一种字符类型");
      return;
    }

    const newStrings = [];
    for (let i = 0; i < config.batchCount; i++) {
      const randomStr = generateRandomString(config.length, charset);
      newStrings.push(randomStr);
    }
    
    setGeneratedStrings(newStrings);
    setCurrentString(newStrings[0] || "");
    message.success(`成功生成 ${newStrings.length} 个随机字符串`);
  }, [config, getCharacterSet, generateRandomString, message]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success("已复制到剪贴板");
    }).catch(() => {
      message.error("复制失败");
    });
  };

  const copyAllStrings = () => {
    const allStrings = generatedStrings.join("\n");
    copyToClipboard(allStrings);
  };

  const getStrengthInfo = () => {
    const charset = getCharacterSet();
    const entropy = Math.log2(Math.pow(charset.length, config.length));
    
    let strength = "弱";
    let color = "#ff4d4f";
    
    if (entropy >= 60) {
      strength = "极强";
      color = "#52c41a";
    } else if (entropy >= 40) {
      strength = "强";
      color = "#1890ff";
    } else if (entropy >= 25) {
      strength = "中等";
      color = "#faad14";
    }
    
    return { strength, entropy: entropy.toFixed(1), color };
  };

  const strengthInfo = getStrengthInfo();

  return (
    <>
      <Head>
        <title>随机字符串生成器 - 爱拓工具箱</title>
      </Head>
      
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* 页面标题 */}
        <Card>
          <Flex vertical align="center" gap="small">
            <Typography.Title level={1} className="gradient-text" style={{ margin: 0 }}>
              🎲 随机字符串生成器
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 16, textAlign: "center" }}>
              生成安全可靠的随机字符串，支持多种字符集和自定义配置
            </Typography.Text>
          </Flex>
        </Card>

        {/* 主功能区域 */}
        <Form form={form} layout="vertical">
          <Row gutter={[24, 24]}>
            {/* 左侧配置区域 */}
            <Col xs={24} lg={12}>
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* 基础设置 */}
                <Card 
                  title={
                    <Space>
                      <span>⚙️</span>
                      <span>基础设置</span>
                    </Space>
                  } 
                  size="small"
                >
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="字符串长度">
                          <InputNumber
                            value={config.length}
                            onChange={(value) => handleConfigChange("length", value || 1)}
                            min={1}
                            max={1000}
                            style={{ width: "100%" }}
                            addonAfter="位"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="生成数量">
                          <InputNumber
                            value={config.batchCount}
                            onChange={(value) => handleConfigChange("batchCount", value || 1)}
                            min={1}
                            max={100}
                            style={{ width: "100%" }}
                            addonAfter="个"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Space>
                </Card>

                {/* 字符集选择 */}
                <Card 
                  title={
                    <Space>
                      <span>🔤</span>
                      <span>字符集选择</span>
                    </Space>
                  } 
                  size="small"
                >
                  <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                    <Form.Item>
                      <Checkbox
                        checked={config.includeUppercase}
                        onChange={(e) => handleConfigChange("includeUppercase", e.target.checked)}
                      >
                        大写字母 (A-Z)
                      </Checkbox>
                    </Form.Item>
                    <Form.Item>
                      <Checkbox
                        checked={config.includeLowercase}
                        onChange={(e) => handleConfigChange("includeLowercase", e.target.checked)}
                      >
                        小写字母 (a-z)
                      </Checkbox>
                    </Form.Item>
                    <Form.Item>
                      <Checkbox
                        checked={config.includeNumbers}
                        onChange={(e) => handleConfigChange("includeNumbers", e.target.checked)}
                      >
                        数字 (0-9)
                      </Checkbox>
                    </Form.Item>
                    <Form.Item>
                      <Checkbox
                        checked={config.includeSymbols}
                        onChange={(e) => handleConfigChange("includeSymbols", e.target.checked)}
                      >
                        特殊符号 (!@#$%^&*)
                      </Checkbox>
                    </Form.Item>
                    <Form.Item>
                      <Checkbox
                        checked={config.excludeSimilar}
                        onChange={(e) => handleConfigChange("excludeSimilar", e.target.checked)}
                      >
                        排除相似字符 (0O1lI|)
                      </Checkbox>
                    </Form.Item>
                    
                    <Divider />
                    
                    <Form.Item label="自定义字符集">
                      <Input
                        value={config.customChars}
                        onChange={(e) => handleConfigChange("customChars", e.target.value)}
                        placeholder="输入自定义字符集（将覆盖上述选择）"
                      />
                    </Form.Item>
                  </Space>
                </Card>
              </Space>
            </Col>

            {/* 右侧预览区域 */}
            <Col xs={24} lg={12}>
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* 生成控制 */}
                <Card 
                  title={
                    <Space>
                      <ThunderboltOutlined />
                      <span>生成控制</span>
                    </Space>
                  } 
                  size="small"
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Button
                      type="primary"
                      block
                      icon={<ReloadOutlined />}
                      onClick={generateStrings}
                      size="large"
                    >
                      生成随机字符串
                    </Button>
                    
                    {generatedStrings.length > 0 && (
                      <Row gutter={8}>
                        <Col span={12}>
                          <Button
                            block
                            icon={<CopyOutlined />}
                            onClick={() => copyToClipboard(currentString)}
                          >
                            复制当前
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            block
                            icon={<CopyOutlined />}
                            onClick={copyAllStrings}
                          >
                            复制全部
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </Space>
                </Card>

                {/* 安全强度 */}
                <Card 
                  title={
                    <Space>
                      <SafetyCertificateOutlined />
                      <span>安全强度</span>
                    </Space>
                  } 
                  size="small"
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="字符集大小"
                        value={getCharacterSet().length}
                        suffix="种字符"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="安全熵"
                        value={strengthInfo.entropy}
                        suffix="bits"
                      />
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: "center" }}>
                        <Text type="secondary">强度等级</Text>
                        <br />
                        <Tag color={strengthInfo.color} style={{ marginTop: 4 }}>
                          {strengthInfo.strength}
                        </Tag>
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* 生成结果 */}
                {generatedStrings.length > 0 && (
                  <Card 
                    title={
                      <Space>
                        <EyeOutlined />
                        <span>生成结果</span>
                      </Space>
                    } 
                    size="small"
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {config.batchCount === 1 ? (
                        <Input
                          value={currentString}
                          readOnly
                          style={{ fontFamily: "monospace", fontSize: "16px" }}
                          suffix={
                            <Button
                              type="text"
                              icon={<CopyOutlined />}
                              onClick={() => copyToClipboard(currentString)}
                            />
                          }
                        />
                      ) : (
                        <TextArea
                          value={generatedStrings.join("\n")}
                          readOnly
                          rows={Math.min(generatedStrings.length, 10)}
                          style={{ fontFamily: "monospace" }}
                        />
                      )}
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        生成时间: {new Date().toLocaleString()}
                      </Text>
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
                  <li>支持多种字符集组合配置</li>
                  <li>可排除容易混淆的相似字符</li>
                  <li>支持自定义字符集</li>
                  <li>批量生成多个字符串</li>
                  <li>实时显示安全强度评估</li>
                </ul>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                title={
                  <Space>
                    <BulbOutlined />
                    <span>安全建议</span>
                  </Space>
                } 
                size="small"
              >
                <ul>
                  <li>密码长度建议至少12位以上</li>
                  <li>重要账户建议使用16位以上密码</li>
                  <li>包含多种字符类型提高安全性</li>
                  <li>定期更换重要账户密码</li>
                </ul>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                title={
                  <Space>
                    <FileTextOutlined />
                    <span>应用场景</span>
                  </Space>
                } 
                size="small"
              >
                <ul>
                  <li>生成安全密码</li>
                  <li>创建API密钥</li>
                  <li>生成验证码</li>
                  <li>创建随机标识符</li>
                  <li>测试数据生成</li>
                </ul>
              </Card>
            </Col>
          </Row>
          
          <Alert
            message="安全提示"
            description="生成的字符串完全在本地浏览器中创建，不会发送到任何服务器。请妥善保管生成的密码，建议使用密码管理器存储。"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Card>
      </Space>
    </>
  );
}