import { NextResponse } from "next/server";
import { getQRCodeByNumber } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const numberStr = searchParams.get("number");

    if (!numberStr) {
      return NextResponse.json(
        { error: "缺少编号参数" },
        { status: 400 }
      );
    }

    const number = parseInt(numberStr, 10);
    if (isNaN(number)) {
      return NextResponse.json(
        { error: "无效的编号" },
        { status: 400 }
      );
    }

    const qrCode = await getQRCodeByNumber(number);

    return NextResponse.json(qrCode);
  } catch (error) {
    console.error("搜索失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
