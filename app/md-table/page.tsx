"use client";

import { useState } from "react";
import { FileSpreadsheet, Copy, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  isNumericColumn,
  parseCsv,
  parseMarkdownTable,
  toCsv,
  toMarkdownTable,
  type Delimiter,
  type TableData,
} from "@/lib/md-table";

type OutputKind = "csv" | "md";

export default function MdTablePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [stats, setStats] = useState("");
  const [outputKind, setOutputKind] = useState<OutputKind>("csv");

  const mdToCsv = () => {
    if (!input.trim()) return;
    const { table, warnings: list } = parseMarkdownTable(input);
    setOutput(toCsv(table, delimiter));
    setWarnings(list.map((item) => item.message));
    setStats(`${table.headers.length} 列 × ${table.rows.length} 行`);
    setOutputKind("csv");
  };

  const csvToMd = () => {
    if (!input.trim()) return;
    const { rows, warnings: list } = parseCsv(input, delimiter);
    const headers = rows[0] ?? [];
    const body = rows.slice(1);
    const table: TableData = {
      headers,
      rows: body,
      alignments: headers.map((_, index) => (isNumericColumn(body, index) ? "right" : "none")),
    };
    setOutput(toMarkdownTable(table));
    setWarnings(list.map((item) => item.message));
    setStats(`${headers.length} 列 × ${body.length} 行`);
    setOutputKind("md");
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setInput(await file.text());
      setWarnings([]);
      toast.success("文件已读取");
    } catch {
      toast.error("读取文件失败");
    }
  };

  const copyToClipboard = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const downloadText = () => {
    if (!output) return;
    const filename = outputKind === "csv" ? "table.csv" : "table.md";
    const mime = outputKind === "csv" ? "text/csv;charset=utf-8" : "text/markdown;charset=utf-8";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("下载已开始");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-emerald-600 shadow-lg">
          <FileSpreadsheet className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Markdown 表格互转</h1>
          <p className="text-muted-foreground">Markdown 表格与 CSV / TSV 双向转换</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">输入</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput("");
                setOutput("");
                setWarnings([]);
                setStats("");
              }}
              disabled={!input}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="粘贴 Markdown 表格或 CSV / TSV 文本..."
              className="min-h-60 font-mono text-sm resize-none bg-muted/30"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="space-y-2">
              <Label>分隔符（CSV 方向）</Label>
              <Tabs value={delimiter} onValueChange={(v) => setDelimiter(v as Delimiter)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value=",">CSV 逗号</TabsTrigger>
                  <TabsTrigger value={"\t"}>TSV 制表符</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={mdToCsv} disabled={!input} className="flex-1 min-w-32">
                Markdown &rarr; CSV
              </Button>
              <Button onClick={csvToMd} disabled={!input} variant="outline" className="flex-1 min-w-32">
                CSV &rarr; Markdown
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">或上传文件（.md / .csv / .tsv / .txt）</Label>
              <Input
                id="file"
                type="file"
                accept=".md,.markdown,.csv,.tsv,.txt"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              输出结果
              {stats && <Badge variant="secondary">{stats}</Badge>}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(output)} disabled={!output}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadText} disabled={!output}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              readOnly
              value={output}
              placeholder="转换结果将显示在这里..."
              className="min-h-75 font-mono text-sm resize-none bg-muted/30"
            />
            {warnings.length > 0 && (
              <Alert>
                <AlertTitle>提示</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    {warnings.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <ul className="list-disc pl-4 space-y-1">
            <li>CSV 解析遵循 RFC4180，支持引号包裹、双引号转义与引号内换行</li>
            <li>Markdown 表格的对齐行会被解析为列对齐方式</li>
            <li>列数不齐时自动补空单元格并提示</li>
          </ul>
          <ul className="list-disc pl-4 space-y-1">
            <li>导出 CSV 时含逗号 / 引号 / 换行的单元格会自动加引号转义</li>
            <li>导出 Markdown 时 &apos;|&apos; 转义为 &apos;\\|&apos;，换行转为 &lt;br&gt;</li>
            <li>自动剥离 BOM，兼容 Excel 导出的文件</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
