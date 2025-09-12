"use client";

import { useState, useEffect } from "react";
import { Card, Button, message, Space, Typography, Avatar, Flex, Tag, Descriptions } from "antd";
import { CarOutlined, PhoneOutlined, BellOutlined, InfoCircleOutlined } from "@ant-design/icons";
import Head from "next/head";

const { Text } = Typography;

export default function MoveCarDisplay() {
  const [plateNumber, setPlateNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [token, setToken] = useState("");
  const [uid, setUid] = useState("");
  const [newEnergy, setNewEnergy] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setPlateNumber(urlParams.get("plateNumber") || "");
    setPhoneNumber(urlParams.get("phoneNumber") || "");
    setToken(urlParams.get("token") || "");
    setUid(urlParams.get("uid") || "");
    setNewEnergy(urlParams.get("new") === "true");
  }, []);

  const notifyOwner = () => {
    const currentTime = new Date().getTime();
    const lastNotifyTimeKey = "lastNotifyTime" + plateNumber;
    const lastNotifyTime = localStorage.getItem(lastNotifyTimeKey);
    const timeDifference = lastNotifyTime ? (currentTime - parseInt(lastNotifyTime)) / 1000 : 0;

    if (lastNotifyTime && timeDifference < 60) {
      message.warning("您已发送过通知，请1分钟后再次尝试。");
      return;
    }

    fetch("https://wxpusher.zjiecode.com/api/send/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appToken: token,
        content: "您好，有人需要您挪车，请及时处理。",
        contentType: 1,
        uids: [uid],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.code === 1000) {
          message.success("通知已发送！");
          localStorage.setItem(lastNotifyTimeKey, currentTime.toString());
        } else {
          message.error("通知发送失败，请稍后重试。");
        }
      })
      .catch((error) => {
        console.error("Error sending notification:", error);
        message.error("通知发送出错，请检查网络连接。");
      });
  };
  const callNumber = () => {
    window.location.href = "tel:" + phoneNumber;
  };

  return (
    <>
      <Head>
        <title>挪车信息 - 爱拓工具箱</title>
        <meta name="description" content="挪车码牌信息页面，支持一键通知和电话呼叫" />
      </Head>
      
      <div className="move-car-container">
        {/* 车牌号展示 */}
        <Card
          variant="borderless"
          className={`plate-card ${newEnergy ? "new-energy" : "standard"}`}
        >
          <Flex vertical align="center" gap="middle" className="plate-content">
            <Avatar
              size={64}
              icon={<CarOutlined />}
              className="plate-avatar"
            />
            
            <div className="plate-number">
              <span className="plate-char">{plateNumber.charAt(0)}</span>
              <span className="plate-char">{plateNumber.charAt(1)}</span>
              <span className="plate-dot">•</span>
              <span className="plate-chars">{plateNumber.slice(2)}</span>
            </div>
            
            {newEnergy && (
              <Tag color="success">
                新能源车辆
              </Tag>
            )}
          </Flex>
        </Card>

        {/* 车辆信息 */}
        <Card
          title={
            <Flex align="center" gap="small">
              <InfoCircleOutlined />
              <span>车辆信息</span>
            </Flex>
          }
          className="info-card"
        >
          <Descriptions column={1} size="middle">
            <Descriptions.Item label="临时停靠">请多关照</Descriptions.Item>
            <Descriptions.Item label="车牌号码">{plateNumber}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{phoneNumber}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 操作按钮 */}
        <Card title="联系车主" className="action-card">
          <Space direction="vertical" size="middle" className="action-buttons">
            {uid && token && (
              <Button
                type="primary"
                size="large"
                block
                icon={<BellOutlined />}
                onClick={notifyOwner}
                className={`notify-btn ${newEnergy ? "new-energy" : "standard"}`}
              >
                微信通知车主
              </Button>
            )}
            
            <Button
              type="primary"
              size="large"
              block
              icon={<PhoneOutlined />}
              onClick={callNumber}
              className={`call-btn ${newEnergy ? "new-energy" : "standard"}`}
            >
              一键拨打电话
            </Button>
          </Space>
        </Card>

        {/* 温馨提示 */}
        <Card 
          size="small"
          className="tip-card"
          variant="borderless"
        >
          <Text type="secondary" className="tip-text">
            💡 温馨提示：请文明用车，合理停放。如需挪车，请耐心等待车主回应。
          </Text>
        </Card>
      </div>
    </>
  );
}
