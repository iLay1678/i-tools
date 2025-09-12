"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Tooltip,
  message,
  Divider,
  Tag,
  Statistic,
  App,
} from "antd";
import {
  FormatPainterOutlined,
  CompressOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  ClearOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function JsonFormatterPage() {
  const { message } = App.useApp();
  const [inputJson, setInputJson] = useState("");
  const [outputJson, setOutputJson] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    characters: 0,
    lines: 0,
    size: "0 B",
    depth: 0,
  });

  // 计算JSON统计信息
  const calculateStats = useCallback((jsonStr: string) => {
    const characters = jsonStr.length;
    const lines = jsonStr.split("\n").length;
    const size = formatBytes(new Blob([jsonStr]).size);
    
    let depth = 0;
    try {
      if (jsonStr.trim()) {
        const parsed = JSON.parse(jsonStr);
        depth = getJsonDepth(parsed);
      }
    } catch {
      // 忽略错误
    }

    setStats({ characters, lines, size, depth });
  }, []);

  // 获取JSON深度
  const getJsonDepth = (obj: unknown): number => {
    if (typeof obj !== "object" || obj === null) return 0;
    
    let maxDepth = 0;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        maxDepth = Math.max(maxDepth, getJsonDepth(item));
      }
    } else {
      const objRecord = obj as Record<string, unknown>;
      for (const key in objRecord) {
        maxDepth = Math.max(maxDepth, getJsonDepth(objRecord[key]));
      }
    }
    return maxDepth + 1;
  };

  // 格式化文件大小
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 验证JSON
  const validateJson = useCallback((jsonStr: string) => {
    if (!jsonStr.trim()) {
      setError("");
      setIsValid(null);
      return null;
    }

    try {
      const parsed = JSON.parse(jsonStr);
      setError("");
      setIsValid(true);
      return parsed;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "未知错误";
      setError(`JSON语法错误: ${errorMsg}`);
      setIsValid(false);
      return null;
    }
  }, []);

  // 格式化JSON
  const formatJson = useCallback(() => {
    const parsed = validateJson(inputJson);
    if (parsed !== null) {
      const formatted = JSON.stringify(parsed, null, 2);
      setOutputJson(formatted);
      calculateStats(formatted);
      message.success("JSON格式化成功！");
    }
  }, [inputJson, validateJson, calculateStats]);

  // 压缩JSON
  const compressJson = useCallback(() => {
    const parsed = validateJson(inputJson);
    if (parsed !== null) {
      const compressed = JSON.stringify(parsed);
      setOutputJson(compressed);
      calculateStats(compressed);
      message.success("JSON压缩成功！");
    }
  }, [inputJson, validateJson, calculateStats]);

  // 验证JSON
  const validateOnly = useCallback(() => {
    validateJson(inputJson);
    if (inputJson.trim()) {
      calculateStats(inputJson);
    }
  }, [inputJson, validateJson, calculateStats]);

  // 复制结果
  const copyResult = useCallback(async () => {
    if (!outputJson) {
      message.warning("没有可复制的内容");
      return;
    }

    try {
      await navigator.clipboard.writeText(outputJson);
      message.success("已复制到剪贴板！");
    } catch {
      message.error("复制失败，请手动复制");
    }
  }, [outputJson]);

  // 清空内容
  const clearAll = useCallback(() => {
    setInputJson("");
    setOutputJson("");
    setError("");
    setIsValid(null);
    setStats({ characters: 0, lines: 0, size: "0 B", depth: 0 });
  }, []);

  // 下载JSON文件
  const downloadJson = useCallback(() => {
    if (!outputJson) {
      message.warning("没有可下载的内容");
      return;
    }

    const blob = new Blob([outputJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success("文件下载开始！");
  }, [outputJson]);

  // 处理文件上传
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputJson(content);
      calculateStats(content);
    };
    reader.readAsText(file);
    
    // 清空input值以允许重复选择同一个文件
    event.target.value = "";
  }, [calculateStats]);

  // 输入变化处理
  const handleInputChange = useCallback((value: string) => {
    setInputJson(value);
    if (value.trim()) {
      validateJson(value);
      calculateStats(value);
    } else {
      setError("");
      setIsValid(null);
      setStats({ characters: 0, lines: 0, size: "0 B", depth: 0 });
    }
  }, [validateJson, calculateStats]);

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>
        {/* 页面标题 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
          📄 JSON格式化工具
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
          强大的JSON处理工具，支持格式化、压缩、验证和统计分析
          </Text>
        </div>

        {/* 功能按钮区 */}
        <Card style={{ marginBottom: 24, borderRadius: 8 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Space wrap>
                <Button
                  type="primary"
                  icon={<FormatPainterOutlined />}
                  onClick={formatJson}
                  disabled={!inputJson.trim() || isValid === false}
                >
                格式化
                </Button>
                <Button
                  icon={<CompressOutlined />}
                  onClick={compressJson}
                  disabled={!inputJson.trim() || isValid === false}
                >
                压缩
                </Button>
                <Button
                  icon={<CheckCircleOutlined />}
                  onClick={validateOnly}
                  disabled={!inputJson.trim()}
                >
                验证
                </Button>
              </Space>
            </Col>
          
            <Col xs={24} sm={12} md={8}>
              <Space wrap>
                <Button
                  icon={<CopyOutlined />}
                  onClick={copyResult}
                  disabled={!outputJson}
                >
                复制结果
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={downloadJson}
                  disabled={!outputJson}
                >
                下载
                </Button>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearAll}
                  danger
                >
                清空
                </Button>
              </Space>
            </Col>

            <Col xs={24} sm={24} md={8}>
              <Space>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                上传文件
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept=".json,.txt"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                  aria-label="上传JSON文件"
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 主要工作区域 */}
        <Row gutter={[24, 24]}>
          {/* 输入区域 */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                输入JSON
                  {isValid === true && (
                    <Tooltip title="JSON格式正确">
                      <Tag color="success">✓</Tag>
                    </Tooltip>
                  )}
                  {isValid === false && (
                    <Tooltip title={error}>
                      <Tag color="error">格式错误</Tag>
                    </Tooltip>
                  )}
                </Space>
              }
              style={{ height: "100%", borderRadius: 8 }}
              styles={{ body: { padding: "16px" } }}
              extra={
                inputJson.trim() && (
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {stats.characters}字符 · {stats.lines}行 · {stats.size} · 深度{stats.depth}
                  </Text>
                )
              }
            >
              <TextArea
                value={inputJson}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="请输入或粘贴JSON数据..."
                style={{
                  minHeight: 400,
                  fontFamily: "Monaco, Menlo, \"Ubuntu Mono\", monospace",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
                autoSize={{ minRows: 20, maxRows: 30 }}
              />
            </Card>
          </Col>

          {/* 输出区域 */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                输出结果
                  {outputJson && (
                    <Tooltip title="点击复制">
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={copyResult}
                      />
                    </Tooltip>
                  )}
                </Space>
              }
              style={{ height: "100%", borderRadius: 8 }}
              styles={{ body: { padding: "16px" } }}
            >
              <TextArea
                value={outputJson}
                readOnly
                placeholder="格式化或压缩后的JSON将显示在这里..."
                style={{
                  minHeight: 400,
                  fontFamily: "Monaco, Menlo, \"Ubuntu Mono\", monospace",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  backgroundColor: "#fafafa",
                }}
                autoSize={{ minRows: 20, maxRows: 30 }}
              />
            </Card>
          </Col>
        </Row>

        {/* 使用说明 */}
        <Card style={{ marginTop: 24, borderRadius: 8 }} title="📖 使用说明">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Title level={5}>🎯 主要功能</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li>JSON格式化：美化JSON，添加缩进和换行</li>
                <li>JSON压缩：移除空格和换行，最小化文件大小</li>
                <li>语法验证：检查JSON格式是否正确</li>
                <li>统计分析：显示字符数、行数、大小等信息</li>
              </ul>
            </Col>
            <Col xs={24} md={12}>
              <Title level={5}>⚡ 快捷操作</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li>支持文件上传和下载</li>
                <li>一键复制结果到剪贴板</li>
                <li>实时语法检查和错误提示</li>
                <li>嵌套深度分析</li>
              </ul>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  );
} 