import { NextResponse } from "next/server";
import { getQRCode, getSubmission } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const qrCode = await getQRCode(id);
    if (!qrCode) {
      return NextResponse.json(
        { error: "二维码不存在" },
        { status: 404 }
      );
    }

    const submission = await getSubmission(id);

    return NextResponse.json({
      qrCode,
      submission,
    });
  } catch (error) {
    console.error("获取详情失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
