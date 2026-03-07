import { NextResponse } from "next/server";
import type {
  SubmissionRecord,
  LouneiSongyaoPayload,
  WaibuSongyaoPayload,
} from "@/lib/types";
import { generateId, getQRCode, saveSubmission } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { qrCodeId, formData } = body as {
      qrCodeId: string;
      formData: LouneiSongyaoPayload | WaibuSongyaoPayload;
    };

    if (!qrCodeId || !formData) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 验证二维码是否存在
    const qrCode = await getQRCode(qrCodeId);
    if (!qrCode) {
      return NextResponse.json(
        { error: "二维码不存在" },
        { status: 404 }
      );
    }

    // 创建提交记录
    const submission: SubmissionRecord = {
      id: generateId(),
      qrCodeId,
      qrNumber: qrCode.number,
      formData,
      submittedAt: new Date().toISOString(),
    };

    // 保存到 KV
    await saveSubmission(submission);

    return NextResponse.json(submission);
  } catch (error) {
    console.error("提交失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
