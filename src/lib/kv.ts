// Vercel KV 客户端配置
// 注意: 需要在 Vercel 项目中配置 KV 数据库后,环境变量会自动注入
// 本地开发时，如果没有环境变量，会自动使用内存存储模拟

import type { QRCodeRecord, SubmissionRecord } from "./types";

// 检查是否有 Vercel KV 环境变量
const hasVercelKV =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

// 根据环境选择使用真实 KV 或本地模拟
let kv: any;

if (hasVercelKV) {
  // 生产环境：使用 Vercel KV
  const vercelKV = require("@vercel/kv");
  kv = vercelKV.kv;
  console.log("✅ 使用 Vercel KV (生产模式)");
} else {
  // 开发环境：使用本地内存存储
  const localKV = require("./kv-local");
  kv = localKV.localKV;
  console.log("⚠️  使用本地内存存储 (开发模式) - 数据不会持久化");
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 获取并递增二维码计数器
 */
export async function getNextQRNumber(): Promise<number> {
  const counter = await kv.incr("qr:counter");
  return counter;
}

/**
 * 保存二维码记录
 */
export async function saveQRCode(record: QRCodeRecord): Promise<void> {
  // 保存记录
  await kv.set(`qr:record:${record.id}`, JSON.stringify(record));

  // 添加到列表 (使用时间戳作为分数)
  const timestamp = new Date(record.createdAt).getTime();
  await kv.zadd("qr:list", { score: timestamp, member: record.id });

  // 保存编号到ID的映射
  await kv.set(`qr:number:${record.number}`, record.id);
}

/**
 * 获取二维码记录
 */
export async function getQRCode(id: string): Promise<QRCodeRecord | null> {
  const data = await kv.get(`qr:record:${id}`);
  if (!data) return null;
  return JSON.parse(data as string) as QRCodeRecord;
}

/**
 * 获取所有二维码列表 (按创建时间倒序)
 */
export async function getQRList(limit = 100): Promise<QRCodeRecord[]> {
  // 从 sorted set 获取 ID 列表 (倒序)
  const ids = await kv.zrange("qr:list", 0, limit - 1, { rev: true });

  if (!ids || ids.length === 0) return [];

  // 批量获取记录
  const records: QRCodeRecord[] = [];
  for (const id of ids) {
    const record = await getQRCode(id as string);
    if (record) records.push(record);
  }

  return records;
}

/**
 * 按编号查找二维码
 */
export async function getQRCodeByNumber(number: number): Promise<QRCodeRecord | null> {
  const id = await kv.get(`qr:number:${number}`);
  if (!id) return null;
  return getQRCode(id as string);
}

/**
 * 保存提交记录
 */
export async function saveSubmission(record: SubmissionRecord): Promise<void> {
  await kv.set(`submission:${record.qrCodeId}`, JSON.stringify(record));
}

/**
 * 获取提交记录
 */
export async function getSubmission(qrCodeId: string): Promise<SubmissionRecord | null> {
  const data = await kv.get(`submission:${qrCodeId}`);
  if (!data) return null;
  return JSON.parse(data as string) as SubmissionRecord;
}

/**
 * 检查二维码是否已提交
 */
export async function hasSubmission(qrCodeId: string): Promise<boolean> {
  const exists = await kv.exists(`submission:${qrCodeId}`);
  return exists === 1;
}
