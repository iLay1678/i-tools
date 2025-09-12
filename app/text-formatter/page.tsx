"use client";

import React, { useState, useCallback } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Tooltip,
  Tag,
  Statistic,
  App,
  Switch,
  Divider
} from 'antd';
import {
  FormatPainterOutlined,
  CopyOutlined,
  ClearOutlined,
  FileTextOutlined,
  DeleteOutlined,
  LineOutlined,
  ScissorOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function TextFormatterPage() {
  const { message } = App.useApp();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [removeSpaces, setRemoveSpaces] = useState(true);
  const [removeLineBreaks, setRemoveLineBreaks] = useState(true);
  const [removeExtraWhitespace, setRemoveExtraWhitespace] = useState(true);
  
  const [stats, setStats] = useState({
    originalChars: 0,
    originalLines: 0,
    formattedChars: 0,
    formattedLines: 0,
    spacesRemoved: 0,
    lineBreaksRemoved: 0,
  });

  // 计算文本统计信息
  const calculateStats = useCallback((original: string, formatted: string) => {
    const originalChars = original.length;
    const originalLines = original.split('\n').length;
    const formattedChars = formatted.length;
    const formattedLines = formatted.split('\n').length;
    
    // 计算移除的空格数量（包括多个连续空格）
    const originalSpaces = (original.match(/\s/g) || []).length;
    const formattedSpaces = (formatted.match(/\s/g) || []).length;
    const spacesRemoved = originalSpaces - formattedSpaces;
    
    const lineBreaksRemoved = Math.max(0, originalLines - formattedLines);

    setStats({
      originalChars,
      originalLines,
      formattedChars,
      formattedLines,
      spacesRemoved,
      lineBreaksRemoved,
    });
  }, []);

  // 格式化文本的核心函数
  const formatText = useCallback(() => {
    if (!inputText.trim()) {
      message.warning('请输入需要格式化的文本');
      return;
    }

    let formatted = inputText;

    // 移除换行符
    if (removeLineBreaks) {
      formatted = formatted.replace(/\r?\n/g, '');
    }

    // 移除词间空格
    if (removeSpaces) {
      formatted = formatted.replace(/\s+/g, '');
    } else if (removeExtraWhitespace) {
      // 如果不移除所有空格，至少移除多余的空白字符
      formatted = formatted.replace(/\s+/g, ' ').trim();
    }

    setOutputText(formatted);
    calculateStats(inputText, formatted);
    message.success('文本格式化完成！');
  }, [inputText, removeSpaces, removeLineBreaks, removeExtraWhitespace, calculateStats, message]);

  // 复制结果
  const copyResult = useCallback(async () => {
    if (!outputText) {
      message.warning('没有可复制的内容');
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      message.success('已复制到剪贴板！');
    } catch {
      message.error('复制失败，请手动复制');
    }
  }, [outputText, message]);

  // 清空内容
  const clearAll = useCallback(() => {
    setInputText('');
    setOutputText('');
    setStats({
      originalChars: 0,
      originalLines: 0,
      formattedChars: 0,
      formattedLines: 0,
      spacesRemoved: 0,
      lineBreaksRemoved: 0,
    });
  }, []);

  // 快速清理 - 一键移除所有格式
  const quickClean = useCallback(() => {
    if (!inputText.trim()) {
      message.warning('请输入需要格式化的文本');
      return;
    }

    // 移除所有格式：换行、多余空格、制表符等
    const formatted = inputText
      .replace(/\r?\n/g, '') // 移除换行
      .replace(/\t/g, '')    // 移除制表符
      .replace(/\s+/g, '')   // 移除所有空格
      .trim();               // 移除首尾空白

    setOutputText(formatted);
    calculateStats(inputText, formatted);
    message.success('快速清理完成！');
  }, [inputText, calculateStats, message]);

  // 处理输入变化
  const handleInputChange = useCallback((value: string) => {
    setInputText(value);
  }, []);

  return (
    <>
      <style jsx>{`
        .formatter-card {
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .stats-card {
          background: linear-gradient(135deg, #f6f8ff 0%, #f0f4ff 100%);
        }
      `}</style>
      
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
        {/* 页面标题 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            ✂️ 文字格式化工具
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            去除复制文本的格式、空格和换行，还原纯净文字内容
          </Text>
        </div>

        {/* 格式化选项 */}
        <Card className="formatter-card" style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            🔧 格式化选项
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Space>
                <Switch
                  checked={removeSpaces}
                  onChange={setRemoveSpaces}
                />
                <Text>移除所有空格</Text>
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <Space>
                <Switch
                  checked={removeLineBreaks}
                  onChange={setRemoveLineBreaks}
                />
                <Text>移除换行符</Text>
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <Space>
                <Switch
                  checked={removeExtraWhitespace}
                  onChange={setRemoveExtraWhitespace}
                  disabled={removeSpaces}
                />
                <Text>移除多余空白</Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 功能按钮区 */}
        <Card className="formatter-card" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12}>
              <Space wrap>
                <Button
                  type="primary"
                  icon={<FormatPainterOutlined />}
                  onClick={formatText}
                  disabled={!inputText.trim()}
                  size="middle"
                >
                  格式化文本
                </Button>
                <Button
                  icon={<ScissorOutlined />}
                  onClick={quickClean}
                  disabled={!inputText.trim()}
                  size="middle"
                >
                  快速清理
                </Button>
                <Button
                  icon={<CopyOutlined />}
                  onClick={copyResult}
                  disabled={!outputText}
                  size="middle"
                >
                  复制结果
                </Button>
              </Space>
            </Col>
            
            <Col xs={24} sm={12}>
              <Space wrap style={{ float: 'right' }}>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearAll}
                  danger
                  size="middle"
                >
                  清空
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 统计信息 */}
        {(inputText || outputText) && (
          <Card className="formatter-card stats-card" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="原始字符数"
                  value={stats.originalChars}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="格式化后字符数"
                  value={stats.formattedChars}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="移除空格数"
                  value={stats.spacesRemoved}
                  prefix={<DeleteOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="移除换行数"
                  value={stats.lineBreaksRemoved}
                  prefix={<LineOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* 主要工作区域 */}
        <Row gutter={[24, 24]}>
          {/* 输入区域 */}
          <Col xs={24} lg={12}>
            <Card
              className="formatter-card"
              title={
                <Space>
                  <FileTextOutlined />
                  输入文本
                  {inputText.trim() && (
                    <Tag color="blue">
                      {stats.originalChars}字符 · {stats.originalLines}行
                    </Tag>
                  )}
                </Space>
              }
              style={{ height: '100%' }}
              styles={{ body: { padding: '16px' } }}
            >
              <TextArea
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="请粘贴需要格式化的文本...&#10;&#10;例如：从Word、PDF或网页复制的带有格式的文本"
                style={{
                  minHeight: 400,
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                }}
                autoSize={{ minRows: 20, maxRows: 30 }}
              />
            </Card>
          </Col>

          {/* 输出区域 */}
          <Col xs={24} lg={12}>
            <Card
              className="formatter-card"
              title={
                <Space>
                  <CheckCircleOutlined />
                  格式化结果
                  {outputText && (
                    <>
                      <Tag color="success">
                        {stats.formattedChars}字符 · {stats.formattedLines}行
                      </Tag>
                      <Tooltip title="点击复制">
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={copyResult}
                        />
                      </Tooltip>
                    </>
                  )}
                </Space>
              }
              style={{ height: '100%' }}
              styles={{ body: { padding: '16px' } }}
            >
              <TextArea
                value={outputText}
                readOnly
                placeholder="格式化后的纯文本将显示在这里..."
                style={{
                  minHeight: 400,
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  backgroundColor: '#fafafa',
                }}
                autoSize={{ minRows: 20, maxRows: 30 }}
              />
            </Card>
          </Col>
        </Row>

        {/* 使用说明 */}
        <Card className="formatter-card" style={{ marginTop: 24 }} title="📖 使用说明">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Title level={5}>🎯 主要功能</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li><strong>去除格式：</strong>清除文本中的各种格式信息</li>
                <li><strong>移除空格：</strong>删除文字间的所有空格字符</li>
                <li><strong>移除换行：</strong>去除文本中的换行符，合并为单行</li>
                <li><strong>统计分析：</strong>显示处理前后的字符数变化</li>
              </ul>
            </Col>
            <Col xs={24} md={12}>
              <Title level={5}>💡 使用场景</Title>
              <ul style={{ paddingLeft: 20 }}>
                <li>处理从Word、PDF复制的文本</li>
                <li>清理网页复制的带格式文本</li>
                <li>去除邮件内容中的多余换行</li>
                <li>整理聊天记录或文档片段</li>
              </ul>
            </Col>
          </Row>
          
          <Divider />
          
          <Title level={5}>⚡ 快速操作</Title>
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <Space wrap>
                <Tag color="blue">Ctrl+A</Tag>
                <Text type="secondary">全选文本</Text>
                <Tag color="green">Ctrl+C</Tag>
                <Text type="secondary">复制</Text>
                <Tag color="orange">Ctrl+V</Tag>
                <Text type="secondary">粘贴</Text>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  );
}