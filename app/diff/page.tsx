"use client";

import React, { useState } from "react";
import { DiffEditor } from "@monaco-editor/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Diff, RotateCcw, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const LANGUAGES = [
  { value: "plaintext", label: "纯文本" },
  { value: "json", label: "JSON" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "sql", label: "SQL" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
];

export default function DiffPage() {
  const { theme } = useTheme();
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [language, setLanguage] = useState("plaintext");
  // Default to side-by-side view (false means side-by-side in Monaco Diff Editor options usually, wait, let's just control options)
  const [renderSideBySide, setRenderSideBySide] = useState(true);

  const handleClear = () => {
    if (confirm("确定要清空所有内容吗？")) {
      setOriginal("");
      setModified("");
      toast.info("已清空");
    }
  };

  const handleSwap = () => {
    const temp = original;
    setOriginal(modified);
    setModified(temp);
    toast.success("已交换原始内容和修改内容");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-slate-500 to-zinc-600 shadow-lg">
            <Diff className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">文本 Diff 对比</h1>
            <p className="text-muted-foreground">
              比较两段文本的差异，支持代码高亮
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-35">
              <SelectValue placeholder="选择语言" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
           <Button
            variant={renderSideBySide ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setRenderSideBySide(true)}
            className="hidden sm:flex"
          >
            左右对比
          </Button>
          <Button
            variant={!renderSideBySide ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setRenderSideBySide(false)}
             className="hidden sm:flex"
          >
            行内对比
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <Card className="flex-1 h-150 flex flex-col overflow-hidden">
        <CardHeader className="py-3 px-4 border-b bg-muted/30 flex flex-row items-center justify-between">
           <div className="flex items-center gap-8">
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                   <span className="w-2 h-2 rounded-full bg-red-500/50"></span>
                   原始内容
               </div>
               <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                   <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                   修改内容
               </div>
           </div>

           <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" onClick={handleSwap} title="交换内容">
                   <ArrowRightLeft className="h-4 w-4" />
               </Button>
               <Button variant="ghost" size="icon" onClick={handleClear} title="清空">
                   <RotateCcw className="h-4 w-4" />
               </Button>
           </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 relative h-full">
          <DiffEditor
            height="100%"
            language={language}
            original={original}
            modified={modified}
            onMount={() => {
                // Determine initial values if needed, but state is controlled slightly differently in DiffEditor
                // actually DiffEditor is better uncontrolled for values usually or we need to manage models.
                // But @monaco-editor/react handles `original` and `modified` props updates well.
                // Listening to changes is a bit more complex if we want 2-way binding, 
                // but for a diff tool, usually users paste into it. 
                // Alternatively, we can use the modifiedModel to get content changes if we really needed 
                // but for a simple comparison tool, just passing props is often enough IF we provide a way to input.
                // WAIT. The DiffEditor is often read-only for the comparison result, OR editable.
                // By default originalEditable: false.
                
                // Let's set originalEditable: true so users can paste into both sides.
            }}
            theme={theme === 'dark' ? "vs-dark" : "light"}
            options={{
              renderSideBySide: renderSideBySide,
              originalEditable: true, // Allow editing left side
              readOnly: false,        // Allow editing right side
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: "on",
            }}
          />
          
          {/* Overlay hints if empty? 
              Monaco editor keeps state internally. 
              If we want to bind state, we might need a standard Editor first to input?
              No, DiffEditor with `originalEditable: true` is fine for direct input.
          */}
        </CardContent>
      </Card>
      
      <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
              💡 提示：您可以直接在左右两侧编辑器中粘贴或输入文本进行通过。上方工具栏可切换语言高亮和对比模式。
          </CardContent>
      </Card>
    </div>
  );
}
