// PostgreSQL 数据库配置（使用 Neon）
// Neon 是 Vercel 推荐的 PostgreSQL 提供商
// 文档: https://neon.tech/docs/serverless/serverless-driver

import { neon } from "@neondatabase/serverless";
import type { QRCodeRecord, SubmissionRecord } from "./types";

// 获取数据库连接
// 优先使用 DATABASE_URL，其次使用 POSTGRES_URL
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    console.warn("⚠️  未配置数据库连接 URL，请设置 DATABASE_URL 或 POSTGRES_URL 环境变量");
  }
  return url || "";
};

const sql = neon(getDatabaseUrl());

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 初始化数据库表（首次运行时调用）
 */
export async function initDatabase(): Promise<void> {
  try {
    // 创建二维码记录表
    await sql`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id VARCHAR(255) PRIMARY KEY,
        number INTEGER UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255)
      )
    `;

    // 创建索引
    await sql`CREATE INDEX IF NOT EXISTS idx_qr_codes_number ON qr_codes(number)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at DESC)`;

    // 创建提交记录表
    await sql`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(255) PRIMARY KEY,
        qr_code_id VARCHAR(255) UNIQUE NOT NULL,
        qr_number INTEGER NOT NULL,
        form_data JSONB NOT NULL,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建提交记录索引
    await sql`CREATE INDEX IF NOT EXISTS idx_submissions_qr_code_id ON submissions(qr_code_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_submissions_qr_number ON submissions(qr_number)`;

    // 创建计数器表
    await sql`
      CREATE TABLE IF NOT EXISTS counters (
        name VARCHAR(50) PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0
      )
    `;

    // 初始化计数器
    await sql`
      INSERT INTO counters (name, value) VALUES ('qr_number', 0)
      ON CONFLICT (name) DO NOTHING
    `;

    console.log("✅ 数据库表初始化成功");
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error);
    throw error;
  }
}

/**
 * 获取并递增二维码计数器
 */
export async function getNextQRNumber(): Promise<number> {
  try {
    // 使用事务确保原子性
    const result = await sql`
      UPDATE counters
      SET value = value + 1
      WHERE name = 'qr_number'
      RETURNING value
    `;

    if (result.length === 0) {
      // 如果计数器不存在，初始化它
      await sql`INSERT INTO counters (name, value) VALUES ('qr_number', 1)`;
      return 1;
    }

    return result[0].value;
  } catch (error) {
    console.error("获取二维码编号失败:", error);
    throw error;
  }
}

/**
 * 保存二维码记录
 */
export async function saveQRCode(record: QRCodeRecord): Promise<void> {
  try {
    await sql`
      INSERT INTO qr_codes (id, number, type, created_at, created_by)
      VALUES (
        ${record.id},
        ${record.number},
        ${record.type},
        ${record.createdAt},
        ${record.createdBy || null}
      )
    `;
  } catch (error) {
    console.error("保存二维码记录失败:", error);
    throw error;
  }
}

/**
 * 获取二维码记录
 */
export async function getQRCode(id: string): Promise<QRCodeRecord | null> {
  try {
    const result = await sql`
      SELECT id, number, type, created_at, created_by
      FROM qr_codes
      WHERE id = ${id}
    `;

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      number: row.number,
      type: row.type,
      createdAt: row.created_at,
      createdBy: row.created_by,
    };
  } catch (error) {
    console.error("获取二维码记录失败:", error);
    throw error;
  }
}

/**
 * 获取所有二维码列表 (按创建时间倒序)
 */
export async function getQRList(limit = 100): Promise<QRCodeRecord[]> {
  try {
    const result = await sql`
      SELECT id, number, type, created_at, created_by
      FROM qr_codes
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.map(row => ({
      id: row.id,
      number: row.number,
      type: row.type,
      createdAt: row.created_at,
      createdBy: row.created_by,
    }));
  } catch (error) {
    console.error("获取二维码列表失败:", error);
    throw error;
  }
}

/**
 * 按编号查找二维码
 */
export async function getQRCodeByNumber(number: number): Promise<QRCodeRecord | null> {
  try {
    const result = await sql`
      SELECT id, number, type, created_at, created_by
      FROM qr_codes
      WHERE number = ${number}
    `;

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      number: row.number,
      type: row.type,
      createdAt: row.created_at,
      createdBy: row.created_by,
    };
  } catch (error) {
    console.error("按编号查找二维码失败:", error);
    throw error;
  }
}

/**
 * 保存提交记录
 */
export async function saveSubmission(record: SubmissionRecord): Promise<void> {
  try {
    await sql`
      INSERT INTO submissions (id, qr_code_id, qr_number, form_data, submitted_at)
      VALUES (
        ${record.id},
        ${record.qrCodeId},
        ${record.qrNumber},
        ${JSON.stringify(record.formData)},
        ${record.submittedAt}
      )
      ON CONFLICT (qr_code_id)
      DO UPDATE SET
        form_data = ${JSON.stringify(record.formData)},
        submitted_at = ${record.submittedAt}
    `;
  } catch (error) {
    console.error("保存提交记录失败:", error);
    throw error;
  }
}

/**
 * 获取提交记录
 */
export async function getSubmission(qrCodeId: string): Promise<SubmissionRecord | null> {
  try {
    const result = await sql`
      SELECT id, qr_code_id, qr_number, form_data, submitted_at
      FROM submissions
      WHERE qr_code_id = ${qrCodeId}
    `;

    if (result.length === 0) return null;

    const row = result[0];
    return {
      id: row.id,
      qrCodeId: row.qr_code_id,
      qrNumber: row.qr_number,
      formData: row.form_data,
      submittedAt: row.submitted_at,
    };
  } catch (error) {
    console.error("获取提交记录失败:", error);
    throw error;
  }
}

/**
 * 检查二维码是否已提交
 */
export async function hasSubmission(qrCodeId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT 1 FROM submissions WHERE qr_code_id = ${qrCodeId} LIMIT 1
    `;
    return result.length > 0;
  } catch (error) {
    console.error("检查提交状态失败:", error);
    throw error;
  }
}
