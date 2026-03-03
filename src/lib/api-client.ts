import type {
  QRCodeRecord,
  SubmissionRecord,
  QRListItem,
  FormType,
  LouneiSongyaoPayload,
  WaibuSongyaoPayload,
} from "./types";

/**
 * 创建新的二维码记录
 */
export async function createQRCode(type: FormType): Promise<QRCodeRecord> {
  const res = await fetch("/api/qr/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`创建二维码失败: ${error}`);
  }

  return res.json();
}

/**
 * 获取二维码列表
 */
export async function getQRList(): Promise<QRListItem[]> {
  const res = await fetch("/api/qr/list");

  if (!res.ok) {
    throw new Error("获取二维码列表失败");
  }

  return res.json();
}

/**
 * 获取单个二维码详情
 */
export async function getQRDetail(id: string): Promise<{
  qrCode: QRCodeRecord;
  submission: SubmissionRecord | null;
}> {
  const res = await fetch(`/api/qr/${id}`);

  if (!res.ok) {
    throw new Error("获取二维码详情失败");
  }

  return res.json();
}

/**
 * 提交表单数据
 */
export async function submitForm(
  qrCodeId: string,
  formData: LouneiSongyaoPayload | WaibuSongyaoPayload
): Promise<SubmissionRecord> {
  const res = await fetch("/api/submission/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrCodeId, formData }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`提交表单失败: ${error}`);
  }

  return res.json();
}

/**
 * 按编号搜索二维码
 */
export async function searchQRByNumber(number: number): Promise<QRCodeRecord | null> {
  const res = await fetch(`/api/qr/search?number=${number}`);

  if (!res.ok) {
    throw new Error("搜索失败");
  }

  return res.json();
}
