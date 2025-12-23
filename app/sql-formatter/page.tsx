"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { format as formatSql } from "sql-formatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Copy, RotateCcw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const SQL_DIALECTS = [
  { value: "sql", label: "Standard SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "mariadb", label: "MariaDB" },
  { value: "plsql", label: "PL/SQL (Oracle)" },
  { value: "tsql", label: "T-SQL (SQL Server)" },
];

export default function SqlFormatterPage() {
  const { theme } = useTheme();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [dialect, setDialect] = useState("sql");

  const handleFormat = () => {
    if (!input.trim()) return;
    try {
      const formatted = formatSql(input, {
        language: dialect as any,
        keywordCase: "upper",
      });
      setOutput(formatted);
      toast.success("SQL 格式化成功");
    } catch (e: any) {
      toast.error("SQL 格式化失败: " + e.message);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg">
          <Database className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SQL 格式化</h1>
          <p className="text-muted-foreground">支持多种数据库方言的 SQL 美化工具</p>
        </div>
      </div>

      {/* Options */}
      <Card>
         <CardContent className="p-4 flex flex-wrap gap-6 items-end">
            <div className="space-y-2">
                <Label>数据库方言</Label>
                <Select value={dialect} onValueChange={setDialect}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SQL_DIALECTS.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                                {d.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleFormat} className="gap-2">
                格式化 <ArrowRight className="h-4 w-4" />
            </Button>
         </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card className="flex flex-col min-h-150">
          <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">输入 SQL</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setInput("")}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 h-125">
             <Editor
                height="100%"
                defaultLanguage="sql"
                theme={theme === "dark" ? "vs-dark" : "light"}
                value={input}
                onChange={(value) => setInput(value || "")}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on"
                }}
             />
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="flex flex-col min-h-150">
          <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">结果</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(output)} disabled={!output}>
              <Copy className="h-4 w-4 mr-2" />
              复制
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 bg-muted/30 h-125">
             <Editor
                height="100%"
                defaultLanguage="sql"
                theme={theme === "dark" ? "vs-dark" : "light"}
                value={output}
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on"
                }}
             />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
