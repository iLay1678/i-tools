"use client";

import { useState } from "react";
import { Network, Search, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function IpCalcPage() {
  const [ip, setIp] = useState("192.168.1.1");
  const [mask, setMask] = useState("24");
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    try {
      const parts = ip.split('.').map(Number);
      if (parts.length !== 4 || parts.some(p => p < 0 || p > 255 || isNaN(p))) {
        toast.error("无效的 IP 地址");
        return;
      }

      const maskNum = parseInt(mask);
      if (isNaN(maskNum) || maskNum < 0 || maskNum > 32) {
        toast.error("无效的掩码 (0-32)");
        return;
      }

      // Convert IP to 32-bit number
      const ipInt = (parts[0] << 24) >>> 0 | (parts[1] << 16) >>> 0 | (parts[2] << 8) >>> 0 | parts[3] >>> 0;
      
      // Calculate Mask
      const maskInt = maskNum === 0 ? 0 : (~0 << (32 - maskNum)) >>> 0;
      
      // Network & Broadcast
      const netInt = (ipInt & maskInt) >>> 0;
      const broadInt = (netInt | ~maskInt) >>> 0;
      
      const intToIp = (i: number) => [
        (i >>> 24) & 0xFF,
        (i >>> 16) & 0xFF,
        (i >>> 8) & 0xFF,
        i & 0xFF
      ].join('.');

      setResult({
        address: ip,
        netmask: intToIp(maskInt),
        wildcard: intToIp(~maskInt >>> 0),
        network: intToIp(netInt),
        broadcast: intToIp(broadInt),
        hostMin: intToIp(netInt + 1),
        hostMax: intToIp(broadInt - 1),
        hosts: maskNum >= 31 ? 0 : Math.pow(2, 32 - maskNum) - 2,
        cidr: `/${maskNum}`
      });
      
    } catch {
      toast.error("计算出错");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg">
          <Network className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IP 地址计算</h1>
          <p className="text-muted-foreground">子网掩码、网络地址、可用主机范围计算</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">网络配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>IP 地址</Label>
              <Input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="如: 192.168.1.1" />
            </div>
            <div className="space-y-2">
              <Label>掩码位 (CIDR)</Label>
              <Input value={mask} onChange={(e) => setMask(e.target.value)} placeholder="如: 24" type="number" />
            </div>
            <Button onClick={calculate} className="w-full gap-2 mt-2">
              <Calculator className="h-4 w-4" />
              立即计算
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">计算结果</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                 <Search className="h-12 w-12 mb-2 opacity-20" />
                 <p>请输入配置并点击计算</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                 <ResultItem label="网络地址" value={result.network} cidr={result.cidr} />
                 <ResultItem label="广播地址" value={result.broadcast} />
                 <ResultItem label="子网掩码" value={result.netmask} />
                 <ResultItem label="反掩码 (Wildcard)" value={result.wildcard} />
                 <ResultItem label="可用主机最小" value={result.hostMin} />
                 <ResultItem label="可用主机最大" value={result.hostMax} />
                 <ResultItem label="可用主机数" value={result.hosts.toLocaleString()} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ResultItem({ label, value, cidr }: { label: string; value: string; cidr?: string }) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-lg font-semibold">{value}</span>
        {cidr && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{cidr}</span>}
      </div>
    </div>
  );
}
