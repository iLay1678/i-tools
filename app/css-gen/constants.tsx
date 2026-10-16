// 从 page.tsx 抽出的默认示例数据、选项常量、说明文案与纯展示子组件（不含业务算法）。
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { Corners, GradientStop, ShadowLayer } from "@/lib/css-gen";

export const newId = () => Math.random().toString(36).slice(2, 9);

export const DEFAULT_CORNERS: Corners = { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 };

export const DEFAULT_STOPS: GradientStop[] = [
  { id: newId(), color: "#6366f1", position: 0 },
  { id: newId(), color: "#ec4899", position: 100 },
];

export const DEFAULT_LAYERS: ShadowLayer[] = [
  { id: newId(), x: 0, y: 10, blur: 15, spread: -3, color: "#00000040", inset: false },
];

export const CORNER_FIELDS: Array<[keyof Corners, string]> = [
  ["topLeft", "左上"],
  ["topRight", "右上"],
  ["bottomRight", "右下"],
  ["bottomLeft", "左下"],
];

export const HELP: string[] = [
  "渐变支持线性 / 径向与多色停，位置倒序时会自动排序后生成。",
  "阴影支持多层叠加，可设置 x / y / blur / spread、颜色与 inset。",
  "圆角支持四角独立值与「水平 / 垂直」斜杠语法（border-radius: a b c d / e f g h）。",
];

export function CornersEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: Corners;
  onChange: (next: Corners) => void;
}) {
  const setCorner = (key: keyof Corners, raw: string) => {
    const num = Number(raw) || 0;
    if (key === "topLeft") onChange({ ...value, topLeft: num });
    else if (key === "topRight") onChange({ ...value, topRight: num });
    else if (key === "bottomRight") onChange({ ...value, bottomRight: num });
    else onChange({ ...value, bottomLeft: num });
  };
  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <div className="grid grid-cols-4 gap-2">
        {CORNER_FIELDS.map(([key, label]) => (
          <div key={key} className="space-y-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <Input type="number" value={value[key]} min={0} onChange={(e) => setCorner(key, e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StopsEditor({
  stops,
  onUpdate,
  onAdd,
  onRemove,
}: {
  stops: GradientStop[];
  onUpdate: (id: string, patch: Partial<GradientStop>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>色停（按位置自动排序）</Label>
        <Button variant="ghost" size="sm" onClick={onAdd} className="gap-1">
          <Plus className="h-4 w-4" />
          添加
        </Button>
      </div>
      {stops.map((stop) => (
        <div key={stop.id} className="flex items-center gap-2">
          <Input
            type="color"
            value={stop.color}
            onChange={(e) => onUpdate(stop.id, { color: e.target.value })}
            className="h-9 w-14 p-1 cursor-pointer"
          />
          <Slider
            value={[stop.position]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => onUpdate(stop.id, { position: v[0] })}
          />
          <span className="w-10 text-xs text-muted-foreground text-right">{stop.position}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(stop.id)}
            disabled={stops.length <= 2}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function LayersEditor({
  layers,
  onAdd,
  onRemove,
  onNumber,
  onField,
}: {
  layers: ShadowLayer[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onNumber: (id: string, key: "x" | "y" | "blur" | "spread", raw: string) => void;
  onField: (id: string, patch: Partial<ShadowLayer>) => void;
}) {
  const numberKeys: Array<"x" | "y" | "blur" | "spread"> = ["x", "y", "blur", "spread"];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>阴影层</Label>
        <Button variant="ghost" size="sm" onClick={onAdd} className="gap-1">
          <Plus className="h-4 w-4" />
          添加
        </Button>
      </div>
      {layers.map((layer) => (
        <div key={layer.id} className="rounded-lg border p-3 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {numberKeys.map((key) => (
              <div key={key} className="space-y-1">
                <span className="text-xs text-muted-foreground">{key}</span>
                <Input
                  type="number"
                  value={layer[key]}
                  min={key === "spread" ? undefined : 0}
                  onChange={(e) => onNumber(layer.id, key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={layer.color.slice(0, 7)}
              onChange={(e) => onField(layer.id, { color: e.target.value })}
              className="h-9 w-14 p-1 cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <Switch checked={layer.inset} onCheckedChange={(checked) => onField(layer.id, { inset: checked })} />
              <span className="text-sm">inset</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(layer.id)}
              disabled={layers.length <= 1}
              className="text-destructive ml-auto"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">提示：blur 不能为负；spread 允许负值。</p>
    </div>
  );
}
