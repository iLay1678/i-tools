"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Code,
  Zap,
  Clock,
  Lock,
  Link as LinkIcon,
  Hash,
  Scissors,
  QrCode,
  FileText,
  Car,
  CloudDownload,
  Search,
  LayoutGrid,
  Diff,
  FileJson,
  FileCode,
  Database,
  Braces,
  Type,
  Binary,
  Languages,
  ImageIcon,
  Calculator,
  FileSpreadsheet,
  ImagePlus,
  Network,
  Barcode,
  Terminal,
  FerrisWheel,
  CircleDollarSign,
  Palette,
  Timer,
  Monitor,
  Keyboard,
  Volume2,
  Users,
  Tally5,
  Hourglass,
  Watch,
  KeySquare,
  ShieldAlert,
  CaseSensitive,
} from "lucide-react";

// --- Data Definitions ---

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  isPlanned?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  tools: Tool[];
}

const categories: Category[] = [
  {
    id: "dev-tools",
    name: "开发工具",
    icon: <Code className="h-4 w-4" />,
    tools: [
      {
        id: "json-formatter",
        title: "JSON 格式化",
        description: "JSON 数据格式化、压缩和验证",
        icon: <Code className="h-6 w-6" />,
        href: "/json-formatter",
        color: "text-blue-500",
      },
      {
        id: "diff",
        title: "文本 Diff 对比",
        description: "使用 Monaco 显示文本差异",
        icon: <Diff className="h-6 w-6" />,
        href: "/diff",
        color: "text-slate-500",
      },
      {
        id: "yaml-formatter",
        title: "YAML 格式化",
        description: "YAML 数据格式化和验证",
        icon: <FileJson className="h-6 w-6" />,
        href: "/yaml-formatter",
        color: "text-amber-600",
      },
      {
        id: "html-formatter",
        title: "HTML 格式化",
        description: "HTML 代码格式化和美化",
        icon: <FileCode className="h-6 w-6" />,
        href: "/html-formatter",
        color: "text-orange-600",
      },
      {
        id: "markdown",
        title: "Markdown 编辑",
        description: "Markdown 实时预览和导出",
        icon: <FileText className="h-6 w-6" />,
        href: "/markdown",
        color: "text-blue-600",
      },
      {
        id: "sql-formatter",
        title: "SQL 格式化",
        description: "SQL 语句格式化和美化",
        icon: <Database className="h-6 w-6" />,
        href: "/sql-formatter",
        color: "text-indigo-600",
      },
      {
        id: "html-escape",
        title: "HTML 转义",
        description: "HTML 实体编码/解码",
        icon: <Braces className="h-6 w-6" />,
        href: "/html-escape",
        color: "text-emerald-600",
      },
    ],
  },
  {
    id: "text-tools",
    name: "文本工具",
    icon: <Scissors className="h-4 w-4" />,
    tools: [
      {
        id: "text-formatter",
        title: "文字格式化",
        description: "清理文本中的多余空格和格式",
        icon: <Scissors className="h-6 w-6" />,
        href: "/text-formatter",
        color: "text-pink-500",
      },
      {
        id: "case-converter",
        title: "大小写转换",
        description: "大写、小写、驼峰等格式转换",
        icon: <CaseSensitive className="h-6 w-6" />,
        href: "/case-converter",
        color: "text-violet-500",
      },
      {
        id: "lorem-ipsum",
        title: "Lorem Ipsum",
        description: "占位文本生成工具",
        icon: <Type className="h-6 w-6" />,
        href: "/lorem-ipsum",
        color: "text-zinc-500",
      },
    ],
  },
  {
    id: "encoding-tools",
    name: "编码工具",
    icon: <Binary className="h-4 w-4" />,
    tools: [
      {
        id: "base64",
        title: "Base64 编解码",
        description: "Base64 编码与解码转换工具",
        icon: <Lock className="h-6 w-6" />,
        href: "/base64",
        color: "text-emerald-500",
      },
      {
        id: "base58",
        title: "Base58 编解码",
        description: "常用于比特币地址等场景",
        icon: <Binary className="h-6 w-6" />,
        href: "/base58",
        color: "text-amber-500",
      },
      {
        id: "base32",
        title: "Base32 编解码",
        description: "常用于 TOTP 等场景",
        icon: <Binary className="h-6 w-6" />,
        href: "/base32",
        color: "text-orange-500",
      },
      {
        id: "unicode",
        title: "Unicode 转换",
        description: "Unicode 字符与编码相互转换",
        icon: <Languages className="h-6 w-6" />,
        href: "/unicode",
        color: "text-blue-500",
      },
      {
        id: "url-encode",
        title: "URL 编解码",
        description: "URL 参数编码与解码处理",
        icon: <LinkIcon className="h-6 w-6" />,
        href: "/url-encode",
        color: "text-cyan-500",
      },
    ],
  },
  {
    id: "conversion-tools",
    name: "转换工具",
    icon: <Clock className="h-4 w-4" />,
    tools: [
      {
        id: "timestamp",
        title: "时间戳转换",
        description: "时间戳与日期时间互相转换",
        icon: <Clock className="h-6 w-6" />,
        href: "/timestamp",
        color: "text-orange-500",
      },
      {
        id: "image-to-pixel",
        title: "图片转像素画",
        description: "将图片转换为像素艺术风格",
        icon: <ImageIcon className="h-6 w-6" />,
        href: "/image-to-pixel",
        color: "text-pink-600",
      },
      {
        id: "radix-converter",
        title: "进制转换器",
        description: "二/八/十/十六进制互转",
        icon: <Calculator className="h-6 w-6" />,
        href: "/radix-converter",
        color: "text-indigo-500",
      },
      {
        id: "csv-json",
        title: "CSV/JSON 互转",
        description: "CSV 与 JSON 格式互相转换",
        icon: <FileSpreadsheet className="h-6 w-6" />,
        href: "/csv-json",
        color: "text-green-600",
      },
      {
        id: "image-base64",
        title: "图片 Base64",
        description: "图片与 Base64 字符串互转",
        icon: <ImagePlus className="h-6 w-6" />,
        href: "/image-base64",
        color: "text-purple-600",
      },
      {
        id: "ip-radix",
        title: "IP 地址转换",
        description: "IP 在不同进制间相互转换",
        icon: <Network className="h-6 w-6" />,
        href: "/ip-radix",
        color: "text-cyan-600",
      },
    ],
  },
  {
    id: "generation-tools",
    name: "生成工具",
    icon: <QrCode className="h-4 w-4" />,
    tools: [
      {
        id: "uuid",
        title: "UUID 生成",
        description: "生成 UUID/GUID 唯一标识符",
        icon: <FileText className="h-6 w-6" />,
        href: "/uuid",
        color: "text-indigo-500",
      },
      {
        id: "random-string",
        title: "随机密码生成",
        description: "生成安全的随机密码",
        icon: <Zap className="h-6 w-6" />,
        href: "/random-string",
        color: "text-purple-500",
      },
      {
        id: "qrcode",
        title: "二维码生成",
        description: "快速生成自定义样式的二维码",
        icon: <QrCode className="h-6 w-6" />,
        href: "/qrcode",
        color: "text-green-500",
      },
      {
        id: "barcode",
        title: "条形码生成",
        description: "生成各种格式的条形码",
        icon: <Barcode className="h-6 w-6" />,
        href: "/barcode",
        color: "text-zinc-700",
      },
      {
        id: "ascii-art",
        title: "ASCII 艺术",
        description: "将文本转换为字符艺术",
        icon: <Terminal className="h-6 w-6" />,
        href: "/ascii-art",
        color: "text-emerald-700",
      },
      {
        id: "wheel",
        title: "大转盘抽奖",
        description: "随机抽奖决策工具",
        icon: <FerrisWheel className="h-6 w-6" />,
        href: "/wheel",
        color: "text-rose-500",
      },
      {
        id: "coin-flip",
        title: "抛硬币",
        description: "随机正反面决策",
        icon: <CircleDollarSign className="h-6 w-6" />,
        href: "/coin-flip",
        color: "text-amber-600",
      },
    ],
  },
  {
    id: "utility-tools",
    name: "实用工具",
    icon: <LayoutGrid className="h-4 w-4" />,
    tools: [
      {
        id: "color-picker",
        title: "颜色选择器",
        description: "HEX/RGB/HSL 格式互转",
        icon: <Palette className="h-6 w-6" />,
        href: "/color-picker",
        color: "text-pink-500",
      },
      {
        id: "regex",
        title: "正则测试器",
        description: "测试和调试正则表达式",
        icon: <Code className="h-6 w-6" />,
        href: "/regex",
        color: "text-blue-600",
      },
      {
        id: "cron",
        title: "Cron 解析器",
        description: "解析和验证 Cron 表达式",
        icon: <Timer className="h-6 w-6" />,
        href: "/cron",
        color: "text-orange-600",
      },
      {
        id: "user-agent",
        title: "UA 解析器",
        description: "解析浏览器 UA 字符串",
        icon: <Monitor className="h-6 w-6" />,
        href: "/user-agent",
        color: "text-slate-600",
      },
      {
        id: "keyboard",
        title: "键盘检测器",
        description: "检测键盘按键事件详情",
        icon: <Keyboard className="h-6 w-6" />,
        href: "/keyboard",
        color: "text-zinc-600",
      },
      {
        id: "tts",
        title: "文字转语音",
        description: "将文本转换为语音播放",
        icon: <Volume2 className="h-6 w-6" />,
        href: "/tts",
        color: "text-cyan-600",
      },
      {
        id: "random-group",
        title: "随机分组",
        description: "快速公平地生成随机团队",
        icon: <Users className="h-6 w-6" />,
        href: "/random-group",
        color: "text-indigo-600",
      },
      {
        id: "scoreboard",
        title: "记分板",
        description: "红蓝双方比分记录",
        icon: <Tally5 className="h-6 w-6" />,
        href: "/scoreboard",
        color: "text-rose-600",
      },
      {
        id: "pomodoro",
        title: "番茄钟",
        description: "番茄工作法计时器",
        icon: <Timer className="h-6 w-6" />,
        href: "/pomodoro",
        color: "text-red-500",
      },
      {
        id: "counter",
        title: "计数器",
        description: "简单的计数工具",
        icon: <Hash className="h-6 w-6" />,
        href: "/counter",
        color: "text-zinc-500",
      },
      {
        id: "countdown",
        title: "倒数计时器",
        description: "设置倒计时到时提醒",
        icon: <Hourglass className="h-6 w-6" />,
        href: "/countdown",
        color: "text-amber-500",
      },
      {
        id: "stopwatch",
        title: "秒表",
        description: "精确计时支持记圈",
        icon: <Watch className="h-6 w-6" />,
        href: "/stopwatch",
        color: "text-blue-500",
      },
      {
        id: "ip-calc",
        title: "IP 地址计算",
        description: "子网掩码与网络划分计算",
        icon: <Network className="h-6 w-6" />,
        href: "/ip-calc",
        color: "text-blue-600",
      },
    ],
  },
  {
    id: "crypto-tools",
    name: "加密工具",
    icon: <Lock className="h-4 w-4" />,
    tools: [
      {
        id: "hash",
        title: "MD5/SHA 哈希",
        description: "计算 MD5、SHA1/256/512 哈希",
        icon: <Hash className="h-6 w-6" />,
        href: "/hash",
        color: "text-rose-500",
      },
      {
        id: "jwt",
        title: "JWT 解码器",
        description: "解析和查看 JWT 内容",
        icon: <KeySquare className="h-6 w-6" />,
        href: "/jwt",
        color: "text-purple-600",
      },
      {
        id: "aes-des",
        title: "AES/DES 加密",
        description: "对称加密解密工具",
        icon: <ShieldAlert className="h-6 w-6" />,
        href: "/aes-des",
        color: "text-red-600",
      },
      {
        id: "bcrypt",
        title: "Bcrypt 哈希",
        description: "生成和验证 Bcrypt 密码",
        icon: <Lock className="h-6 w-6" />,
        href: "/bcrypt",
        color: "text-slate-700",
      },
    ],
  },
  {
    id: "life-tools",
    name: "生活工具",
    icon: <Car className="h-4 w-4" />,
    tools: [
      {
        id: "move-car",
        title: "挪车码牌",
        description: "生成专属挪车码牌，支持微信推送",
        icon: <Car className="h-6 w-6" />,
        href: "/move-car",
        color: "text-yellow-500",
      },
      {
        id: "alipan-tv-token",
        title: "阿里云盘 Token",
        description: "获取阿里云盘 TV 端授权令牌",
        icon: <CloudDownload className="h-6 w-6" />,
        href: "/alipan-tv-token",
        color: "text-teal-500",
      },
    ],
  },
];

// --- Main Layout Component ---

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Flatten tools for easier filtering
  const allTools = useMemo(() => {
    return categories.flatMap((cat) =>
      cat.tools.map((tool) => ({ ...tool, categoryId: cat.id }))
    );
  }, []);

  // Filter Logic
  const filteredTools = useMemo(() => {
    let tools = allTools;

    // 1. Category Filter
    if (activeCategory !== "all") {
      tools = tools.filter((tool) => tool.categoryId === activeCategory);
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tools = tools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
      );
    }

    return tools;
  }, [allTools, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col space-y-6 pb-10">
      {/* Hero Section */}
      <section className="flex flex-col items-center pt-8 pb-4 text-center space-y-4 md:pt-12 lg:pt-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="space-y-2 max-w-3xl px-4">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl text-foreground">
            爱拓工具箱
          </h1>
          <p className="mx-auto max-w-175 text-muted-foreground text-base sm:text-lg">
            简约、高效的在线开发者工具集合。让繁琐的数据处理变得简单。
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full max-w-lg px-4 relative mt-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索工具，例如：JSON、二维码..."
              className="w-full h-12 pl-12 pr-4 rounded-full border border-input bg-background/50 hover:bg-accent/50 focus:bg-background transition-all ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 shadow-xs text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container max-w-6xl mx-auto px-4 space-y-8">
        {/* Category Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <Link 
                key={tool.id} 
                href={tool.isPlanned ? "#" : tool.href} 
                className={`group block h-full ${tool.isPlanned ? "cursor-not-allowed" : ""}`}
                onClick={(e) => tool.isPlanned && e.preventDefault()}
              >
                <div className={`relative h-full overflow-hidden rounded-xl border bg-card text-card-foreground transition-all duration-300 ${!tool.isPlanned && "hover:shadow-md hover:-translate-y-1 hover:border-primary/20 group-hover:bg-accent/5"}`}>
                  <div className="p-5 flex items-center gap-4 text-left h-full">
                    <div
                      className={`relative shrink-0 flex h-12 w-12 items-center justify-center rounded-xl ${tool.color} transition-transform duration-300 ${!tool.isPlanned && "group-hover:scale-110 group-hover:rotate-3"}`}
                    >
                       <div className="absolute inset-0 bg-current opacity-10 rounded-xl" />
                       {tool.icon}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold tracking-tight text-base">
                          {tool.title}
                        </h3>
                        {tool.isPlanned && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            敬请期待
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">未找到相关工具</h3>
              <p className="text-muted-foreground mt-2">
                换个关键词试试，或者浏览其他分类。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
