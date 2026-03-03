import { NextResponse } from "next/server";
import type { QRListItem } from "@/lib/types";
import { getQRList, hasSubmission } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const records = await getQRList();

    // 检查每个二维码是否有提交记录
    const listItems: QRListItem[] = await Promise.all(
      records.map(async (record) => ({
        id: record.id,
        number: record.number,
        type: record.type,
        createdAt: record.createdAt,
        hasSubmission: await hasSubmission(record.id),
      }))
    );

    return NextResponse.json(listItems);
  } catch (error) {
    console.error("获取列表失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
