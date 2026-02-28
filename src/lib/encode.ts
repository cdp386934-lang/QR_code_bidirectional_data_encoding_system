import type { FormDataType } from "./types";

const PREFIX = "QRFORM:";

/**
 * 将结构化表单数据编码为可写入二维码的字符串：JSON 序列化后 Base64 编码，并加前缀便于识别。
 */
export function encodePayload(data: FormDataType): string {
  const json = JSON.stringify(data);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return PREFIX + base64;
}

/**
 * 从二维码内容解析出结构化数据。支持带 PREFIX 或不带（兼容纯 Base64）。
 */
export function decodePayload(raw: string): FormDataType {
  let base64 = raw.trim();
  if (base64.startsWith(PREFIX)) {
    base64 = base64.slice(PREFIX.length);
  }
  let json: string;
  try {
    json = decodeURIComponent(escape(atob(base64)));
  } catch {
    throw new Error("无效的 Base64 内容");
  }
  const data = JSON.parse(json) as FormDataType;
  if (
    data.type !== "neibu" &&
    data.type !== "waibu" &&
    data.type !== "楼内送药" &&
    data.type !== "外送送药"
  ) {
    throw new Error("未知的表单类型");
  }
  return data;
}

/**
 * 将表单数据编码为结果页 URL（信息全部存储在 URL 的查询参数 d 中）。
 */
export function payloadToResultUrl(data: FormDataType, baseUrl: string): string {
  const encoded = encodePayload(data);
  const url = new URL("/result", baseUrl);
  url.searchParams.set("d", encoded);
  return url.toString();
}

/**
 * 从结果页 URL（或二维码中的 URL 字符串）解析出结构化数据。
 */
export function decodeFromResultUrl(urlString: string): FormDataType {
  try {
    const url = new URL(urlString);
    if (url.pathname !== "/result" && !url.pathname.endsWith("/result")) {
      throw new Error("不是有效的结果页链接");
    }
    const d = url.searchParams.get("d");
    if (!d) throw new Error("链接缺少参数 d");
    return decodePayload(d.trim());
  } catch (e) {
    if (e instanceof Error && e.message !== "不是有效的结果页链接" && !e.message.startsWith("链接")) {
      throw e;
    }
    throw new Error("无法从链接解析数据");
  }
}

/**
 * 判断字符串是否为结果页 URL（可从中解析数据）。
 */
export function isResultUrl(str: string): boolean {
  const s = str.trim();
  if (!s.startsWith("http://") && !s.startsWith("https://")) return false;
  try {
    const url = new URL(s);
    return (url.pathname === "/result" || url.pathname.endsWith("/result")) && url.searchParams.has("d");
  } catch {
    return false;
  }
}

/**
 * 将解析后的结构化数据格式化为可复制给收银系统打印的文本。
 */
export function formatForPrint(data: FormDataType): string {
  if (data.type === "楼内送药") {
    return [
      "【楼内送药】",
      `姓名：${data.name}`,
      `电话：${data.phone}`,
      `医院：${data.hospital}`,
      `几号楼：${data.building}`,
      `楼层：${data.floor}`,
      `科室：${data.department}`,
      `病房号：${data.room}`,
      `病床号：${data.bed}`,
      `提交时间：${data.timestamp}`,
    ].join("\n");
  }
  if (data.type === "neibu") {
    return [
      "【楼内送药】",
      `房间号：${data.roomNumber}`,
      `患者姓名：${data.patientName}`,
      `药品清单：${data.medicineList}`,
      data.remark ? `备注：${data.remark}` : null,
      `提交时间：${data.submitTime}`,
    ]
      .filter(Boolean)
      .join("\n");
  }
  if (data.type === "外送送药") {
    return [
      "【外送送药】",
      `姓名：${data.name}`,
      `电话：${data.phone}`,
      `小区名称：${data.community}`,
      `街道号：${data.street}`,
      `楼栋：${data.building}`,
      `单元门：${data.unit}`,
      `楼层：${data.floor}`,
      `门牌号：${data.room}`,
      `提交时间：${data.timestamp}`,
    ].join("\n");
  }
  return [
    "【外送送药】",
    `收件人：${data.recipientName}`,
    `联系电话：${data.phone}`,
    `配送地址：${data.address}`,
    `药品清单：${data.medicineList}`,
    data.remark ? `备注：${data.remark}` : null,
    `提交时间：${data.submitTime}`,
  ]
    .filter(Boolean)
    .join("\n");
}
