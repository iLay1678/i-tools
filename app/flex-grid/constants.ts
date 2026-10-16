// 从 page.tsx 抽出的选项常量、说明文案与纯展示辅助（不含业务算法）。
import type { CSSProperties } from "react";
import type {
  AlignContent,
  AlignItems,
  FlexDirection,
  FlexWrap,
  JustifyContent,
} from "@/lib/flex-grid";

export const DIRECTIONS: FlexDirection[] = ["row", "row-reverse", "column", "column-reverse"];

export const WRAPS: FlexWrap[] = ["nowrap", "wrap", "wrap-reverse"];

export const JUSTIFY: JustifyContent[] = [
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
  "space-evenly",
];

export const ALIGN_ITEMS: AlignItems[] = ["stretch", "flex-start", "flex-end", "center", "baseline"];

export const ALIGN_CONTENT: AlignContent[] = [
  "stretch",
  "flex-start",
  "flex-end",
  "center",
  "space-between",
  "space-around",
];

// lib 返回 Record<string, string>，此处断言为 React 的 CSSProperties（不使用 any）。
export function toStyle(style: Record<string, string>): CSSProperties {
  return style as unknown as CSSProperties;
}

export const HELP: string[] = [
  "Flex 面板覆盖 direction / wrap / justify-content / align-items / align-content 与 gap。",
  "align-content 仅在开启换行（非 nowrap）时生效，预览区已固定高度以体现对齐差异。",
  "Grid 面板提供列数与对齐；gap 与对齐控件在两种模式下共用。",
];
