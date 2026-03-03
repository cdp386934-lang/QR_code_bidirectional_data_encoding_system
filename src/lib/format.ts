import type { LouneiSongyaoPayload, WaibuSongyaoPayload } from "./types";

/**
 * 格式化时间为本地可读格式
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 格式化日期为简短格式
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 格式化二维码编号
 */
export function formatQRNumber(num: number): string {
  return `NO.${num.toString().padStart(2, "0")}`;
}

/**
 * 生成层级结构显示文本（楼内送药）
 */
export function formatHierarchyLounei(data: LouneiSongyaoPayload): string {
  return [
    `└─ 医院: ${data.hospital}`,
    `   └─ 楼号: ${data.building}`,
    `      └─ 楼层: ${data.floor}`,
    `         └─ 科室: ${data.department}`,
    `            └─ 病房: ${data.room}`,
    `               └─ 病床: ${data.bed}`,
  ].join("\n");
}

/**
 * 生成层级结构显示文本（外送送药）
 */
export function formatHierarchyWaibu(data: WaibuSongyaoPayload): string {
  const parts: string[] = [];

  if (data.community) {
    parts.push(`└─ 小区: ${data.community}`);
    const indent = "   ";
    if (data.building) parts.push(`${indent}└─ 楼栋: ${data.building}`);
    if (data.unit) parts.push(`${indent}   └─ 单元: ${data.unit}`);
    if (data.floor) parts.push(`${indent}      └─ 楼层: ${data.floor}`);
    if (data.room) parts.push(`${indent}         └─ 门牌: ${data.room}`);
  } else if (data.street) {
    parts.push(`└─ 街道: ${data.street}`);
    const indent = "   ";
    if (data.building) parts.push(`${indent}└─ 楼栋: ${data.building}`);
    if (data.unit) parts.push(`${indent}   └─ 单元: ${data.unit}`);
    if (data.floor) parts.push(`${indent}      └─ 楼层: ${data.floor}`);
    if (data.room) parts.push(`${indent}         └─ 门牌: ${data.room}`);
  }

  return parts.join("\n");
}
