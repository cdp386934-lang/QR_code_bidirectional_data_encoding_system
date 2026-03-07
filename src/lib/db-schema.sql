-- QR码编号管理系统数据库表结构

-- 二维码记录表
CREATE TABLE IF NOT EXISTS qr_codes (
  id VARCHAR(255) PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255)
);

-- 创建编号索引
CREATE INDEX IF NOT EXISTS idx_qr_codes_number ON qr_codes(number);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at DESC);

-- 客户提交记录表
CREATE TABLE IF NOT EXISTS submissions (
  id VARCHAR(255) PRIMARY KEY,
  qr_code_id VARCHAR(255) UNIQUE NOT NULL,
  qr_number INTEGER NOT NULL,
  form_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id) ON DELETE CASCADE
);

-- 创建提交记录索引
CREATE INDEX IF NOT EXISTS idx_submissions_qr_code_id ON submissions(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_submissions_qr_number ON submissions(qr_number);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);

-- 全局计数器表（用于生成二维码编号）
CREATE TABLE IF NOT EXISTS counters (
  name VARCHAR(50) PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

-- 初始化计数器
INSERT INTO counters (name, value) VALUES ('qr_number', 0)
ON CONFLICT (name) DO NOTHING;
