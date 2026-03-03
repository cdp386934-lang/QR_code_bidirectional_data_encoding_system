import { NextResponse } from "next/server";
import type { FormType, QRCodeRecord } from "@/lib/types";
import {
  generateId,
  getNextQRNumber,
  saveQRCode,
} from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body as { type: FormType };

    if (!type || (type !== "neibu" && type !== "waibu")) {
      return NextResponse.json(
        { error: "无效的类型参数" },
        { status: 400 }
      );
    }

    // 生成唯一ID和编号
    const id = generateId();
    const number = await getNextQRNumber();

    // 创建记录
    const record: QRCodeRecord = {
      id,
      number,
      type,
      createdAt: new Date().toISOString(),
    };

    // 保存到 KV
    await saveQRCode(record);

    return NextResponse.json(record);
  } catch (error) {
    console.error("创建二维码失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
