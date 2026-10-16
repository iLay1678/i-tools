"use client";

import { useMemo, useState } from "react";
import { Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addToDate,
  calcAge,
  calcInterval,
  calcWorkday,
  isValidDateInput,
  toDateInputValue,
  type DateUnit,
  type IntervalResult,
} from "@/lib/date-calc";

type Mode = "interval" | "add" | "workday" | "age";

const UNITS: Array<[DateUnit, string]> = [
  ["day", "天"],
  ["week", "周"],
  ["month", "月"],
  ["year", "年"],
];

// 将 input[type=date] 的字符串按本地时区解析为 Date（校验复用 lib）。
function fromInputValue(value: string): Date | null {
  if (!isValidDateInput(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  return `${toDateInputValue(date)}（${date.toLocaleDateString("zh-CN", { weekday: "long" })}）`;
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (next: Date) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="date"
        value={toDateInputValue(value)}
        onChange={(e) => {
          const next = fromInputValue(e.target.value);
          if (next) onChange(next);
        }}
      />
      <div className="w-fit rounded-md border p-1">
        <Calendar mode="single" selected={value} onSelect={(day) => day && onChange(day)} />
      </div>
    </div>
  );
}

export default function DateCalcPage() {
  const [mode, setMode] = useState<Mode>("interval");
  const [start, setStart] = useState<Date>(() => new Date());
  const [end, setEnd] = useState<Date>(() => new Date());
  const [base, setBase] = useState<Date>(() => new Date());
  const [amount, setAmount] = useState(7);
  const [unit, setUnit] = useState<DateUnit>("day");
  const [workStart, setWorkStart] = useState<Date>(() => new Date());
  const [workDays, setWorkDays] = useState(10);
  const [includeStart, setIncludeStart] = useState(true);
  const [birth, setBirth] = useState<Date>(() => new Date(2000, 0, 1));
  const [reference, setReference] = useState<Date>(() => new Date());

  const interval = useMemo(() => calcInterval(start, end), [start, end]);
  const added = useMemo(() => addToDate(base, amount, unit), [base, amount, unit]);
  const workday = useMemo(() => calcWorkday(workStart, workDays, includeStart), [workStart, workDays, includeStart]);
  const age = useMemo(() => calcAge(birth, reference), [birth, reference]);

  const renderInterval = (data: IntervalResult) => (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg bg-muted p-4 space-y-1">
        <p className="text-xs text-muted-foreground">相差</p>
        <div className="text-lg font-semibold">
          {data.years} 年 {data.months} 月 {data.days} 天
        </div>
      </div>
      <div className="rounded-lg bg-muted p-4 space-y-1">
        <p className="text-xs text-muted-foreground">总天数</p>
        <div className="text-lg font-semibold">{data.totalDays} 天</div>
      </div>
      <div className="rounded-lg bg-muted p-4 space-y-1">
        <p className="text-xs text-muted-foreground">周数</p>
        <div className="text-lg font-semibold">
          {data.totalWeeks} 周 {data.remainderDays} 天
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-cyan-600 shadow-lg">
          <Hourglass className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">日期计算器</h1>
          <p className="text-muted-foreground">日期间隔、日期加减、工作日与年龄计算</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="interval">日期间隔</TabsTrigger>
              <TabsTrigger value="add">日期加减</TabsTrigger>
              <TabsTrigger value="workday">工作日</TabsTrigger>
              <TabsTrigger value="age">年龄</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === "interval" && (
            <div className="grid gap-6 md:grid-cols-2">
              <DatePickerField label="起始日期" value={start} onChange={setStart} />
              <DatePickerField label="结束日期" value={end} onChange={setEnd} />
            </div>
          )}

          {mode === "add" && (
            <div className="grid gap-6 md:grid-cols-2">
              <DatePickerField label="基准日期" value={base} onChange={setBase} />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">数量</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>单位</Label>
                  <Select value={unit} onValueChange={(v) => setUnit(v as DateUnit)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => setBase(new Date())} className="w-full">
                  使用今天
                </Button>
              </div>
            </div>
          )}

          {mode === "workday" && (
            <div className="grid gap-6 md:grid-cols-2">
              <DatePickerField label="起始日期" value={workStart} onChange={setWorkStart} />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workDays">工作日天数</Label>
                  <Input
                    id="workDays"
                    type="number"
                    value={workDays}
                    onChange={(e) => setWorkDays(Number(e.target.value) || 0)}
                    className="font-mono"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="includeStart" className="cursor-pointer">
                    包含起始日
                  </Label>
                  <Switch id="includeStart" checked={includeStart} onCheckedChange={setIncludeStart} />
                </div>
              </div>
            </div>
          )}

          {mode === "age" && (
            <div className="grid gap-6 md:grid-cols-2">
              <DatePickerField label="出生日期" value={birth} onChange={setBirth} />
              <DatePickerField label="参考日期" value={reference} onChange={setReference} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">计算结果</CardTitle>
        </CardHeader>
        <CardContent>
          {mode === "interval" && renderInterval(interval)}
          {mode === "age" && renderInterval(age)}
          {mode === "add" && (
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-xs text-muted-foreground">结果日期</p>
              <div className="text-lg font-semibold">{formatDate(added.date)}</div>
            </div>
          )}
          {mode === "workday" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-muted p-4 space-y-1">
                <p className="text-xs text-muted-foreground">结果日期</p>
                <div className="text-lg font-semibold">{formatDate(workday.date)}</div>
              </div>
              <div className="rounded-lg bg-muted p-4 space-y-1">
                <p className="text-xs text-muted-foreground">跨过的周末天数</p>
                <div className="text-lg font-semibold">{workday.weekendDays} 天</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">💡</span> 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. 起止日期顺序颠倒时会自动交换后再计算。</p>
          <p>2. 月末加减遵循 addMonths 行为：如 1/31 + 1 月 → 2/29（闰年）或 2/28。</p>
          <p>3. 工作日计算自动跳过周六、周日；所有计算基于本地时区。</p>
        </CardContent>
      </Card>
    </div>
  );
}
