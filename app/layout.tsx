'use client'

import React from 'react'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider, Layout, Typography, Space, App } from 'antd'
import { HomeOutlined, ToolOutlined, GithubOutlined, HeartOutlined } from '@ant-design/icons'
import Link from 'next/link'
import './globals.css'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

const antdTheme = {
  token: {
    colorPrimary: '#00d4aa',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 16,
    borderRadiusLG: 20,
    borderRadiusXS: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    lineHeight: 1.6,
    boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  },  components: {
    Layout: {
      headerBg: 'rgba(255, 255, 255, 0.95)',
      headerHeight: 72,
      headerPadding: '0 24px',
    },
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <title>爱拓工具箱 - 在线工具集合</title>
        <meta name="description" content="爱拓工具箱提供各种实用的在线工具，包括二维码生成、阿里云盘TV Token获取、挪车码牌生成等。" />
        <meta name="keywords" content="在线工具,二维码生成器,阿里云盘,挪车码牌,工具箱" />
        <meta name="author" content="爱拓工具箱" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AntdRegistry>
          <ConfigProvider theme={antdTheme}>
            <App>
              <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
                <Header className="site-header">
                  <div className="site-header-content">                    <Link href="/" className="logo-link">
                      <Space size="middle">
                        <ToolOutlined className="logo-icon" />
                        <span className="gradient-text">爱拓工具箱</span>
                      </Space>
                    </Link>
                    
                    <Space size="large">                      <Link href="/" className="nav-link">
                        <Space>
                          <HomeOutlined />
                          <span>首页</span>
                        </Space>
                      </Link>                      <Link 
                        href="https://github.com/iLay1678/i-tools" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="nav-link"
                      >
                        <Space>
                          <GithubOutlined />
                          <span>GitHub</span>
                        </Space>
                      </Link>
                    </Space>
                  </div>
                </Header>
                  <Content style={{ padding: '32px 24px', flex: 1 }}>
                  <div className="site-content">
                    {children}
                  </div>
                </Content>
                
                <Footer style={{ 
                  textAlign: 'center',
                  background: 'rgba(250, 250, 250, 0.8)',
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                  backdropFilter: 'blur(10px)',
                }}>                  <Space direction="vertical" size="small">
                    <Space>
                      <HeartOutlined className="footer-icon" />
                      <Text className="footer-text">
                        © {new Date().getFullYear()} 爱拓工具箱 - 让工具更简单，让生活更高效
                      </Text>
                    </Space>
                  </Space>
                </Footer>
              </Layout>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
