"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Network, Copy } from "lucide-react";
import { toast } from "sonner";

// --- Helper Functions ---

// IPv4
const ipv4ToInt = (ip: string) => 
  ip.split('.').reduce((acc, octet) => (acc << 8n) + BigInt(parseInt(octet, 10)), 0n);

const intToIpv4 = (int: bigint) => 
  [(int >> 24n) & 0xffn, (int >> 16n) & 0xffn, (int >> 8n) & 0xffn, int & 0xffn].join('.');

// IPv6 (simplified)
const ipv6ToBigInt = (ip: string) => {
   // Expansion of ::
   if(ip.includes('::')) {
       const parts = ip.split('::');
       const left = parts[0].split(':').filter(Boolean);
       const right = parts[1].split(':').filter(Boolean);
       const missing = 8 - (left.length + right.length);
       const expanded = [...left, ...Array(missing).fill('0'), ...right];
       ip = expanded.join(':');
   }
   
   const parts = ip.split(':');
   let result = 0n;
   for (const part of parts) {
       result = (result << 16n) + BigInt(parseInt(part || '0', 16));
   }
   return result;
};

const bigIntToIpv6 = (int: bigint) => {
    let parts = [];
    for (let i = 0; i < 8; i++) {
        parts.unshift((int & 0xffffn).toString(16));
        int >>= 16n;
    }
    // Simple compression (not full RFC 5952 compliant but good enough for display)
    return parts.join(':').replace(/(^|:)0(:0)*:0(:|$)/, '::');
};

export default function IpRadixPage() {
  const [ip, setIp] = useState("192.168.1.1");
  const [type, setType] = useState<"IPv4" | "IPv6">("IPv4");
  
  const [decimal, setDecimal] = useState("");
  const [hex, setHex] = useState("");
  const [binary, setBinary] = useState("");
  
  const [errorV4, setErrorV4] = useState("");

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  useEffect(() => {
    if (!ip.trim()) return;

    try {
        let val: bigint;
        if (ip.includes(':')) {
            setType("IPv6");
            val = ipv6ToBigInt(ip);
        } else {
            setType("IPv4");
            // Basic IPv4 validation
            if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
                 if (/^\d+$/.test(ip)) {
                    // Treat as decimal input
                    val = BigInt(ip);
                 } else {
                     throw new Error("Invalid Format");
                 }
            } else {
                val = ipv4ToInt(ip);
            }
        }
        
        setErrorV4("");
        setDecimal(val.toString());
        setHex("0x" + val.toString(16).toUpperCase());
        setBinary(val.toString(2));
        
    } catch {
        setDecimal("---");
        setHex("---");
        setBinary("---");
        setErrorV4("无效的 IP 地址格式");
    }
  }, [ip]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 shadow-lg">
          <Network className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IP 进制转换</h1>
          <p className="text-muted-foreground">IPv4/IPv6 地址与十进制、十六进制、二进制互转</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>输入 IP 地址</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label>IPv4, IPv6 或 整数值</Label>
                    <div className="flex gap-2">
                         <Input 
                            value={ip}
                            onChange={(e) => setIp(e.target.value)}
                            placeholder="例如: 192.168.1.1 或 2001:db8::1"
                            className="font-mono text-lg"
                         />
                    </div>
                     {errorV4 && <p className="text-sm text-destructive">{errorV4}</p>}
                     <p className="text-xs text-muted-foreground">
                         自动识别 IPv4 / IPv6 格式。支持输入十进制整数反向转换。
                     </p>
                </div>
            </CardContent>
        </Card>
        
        {/* Results */}
        
        <Card>
            <CardHeader>
                <CardTitle className="text-base text-muted-foreground">标准格式 ({type})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="p-4 bg-muted/40 rounded-lg font-mono text-lg break-all flex justify-between items-start">
                    <span>{type === 'IPv4' ? intToIpv4(BigInt(decimal || 0)) : bigIntToIpv6(BigInt(decimal || 0))}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 ml-2" onClick={() => copyToClipboard(type === 'IPv4' ? intToIpv4(BigInt(decimal || 0)) : bigIntToIpv6(BigInt(decimal || 0)))}>
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-base text-muted-foreground">十进制 (Decimal)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="p-4 bg-muted/40 rounded-lg font-mono text-lg break-all flex justify-between items-start">
                    <span>{decimal}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 ml-2" onClick={() => copyToClipboard(decimal)}>
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-base text-muted-foreground">十六进制 (Hex)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="p-4 bg-muted/40 rounded-lg font-mono text-lg break-all flex justify-between items-start">
                    <span>{hex}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 ml-2" onClick={() => copyToClipboard(hex)}>
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-base text-muted-foreground">二进制 (Binary)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="p-4 bg-muted/40 rounded-lg font-mono text-sm break-all flex justify-between items-start max-h-40 overflow-y-auto">
                    <span>{binary}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 ml-2" onClick={() => copyToClipboard(binary)}>
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
