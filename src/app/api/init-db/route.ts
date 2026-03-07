import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * 初始化数据库表
 * 访问 /api/init-db 来创建所有必要的表
 */
export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({
      success: true,
      message: "数据库表初始化成功",
    });
  } catch (error) {
    console.error("数据库初始化失败:", error);
    return NextResponse.json(
      {
        success: false,
        error: "数据库初始化失败",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
