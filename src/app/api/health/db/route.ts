import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";

export const dynamic = "force-dynamic";

function classifyDbError(error: unknown): string {
  const text = String(error instanceof Error ? error.message : error).toLowerCase();
  const cause = String((error as { cause?: unknown })?.cause ?? "").toLowerCase();
  const merged = `${text} ${cause}`;

  if (merged.includes("fetch failed") || merged.includes("econnreset")) {
    return "network_unstable";
  }
  if (merged.includes("relation") && merged.includes("does not exist")) {
    return "schema_not_initialized";
  }
  if (merged.includes("timeout") || merged.includes("etimedout")) {
    return "database_timeout";
  }
  return "database_error";
}

export async function GET() {
  try {
    const health = await checkDatabaseHealth();

    return NextResponse.json(
      {
        status: "ok",
        ...health,
        message: "数据库连接正常",
      },
      { status: 200 }
    );
  } catch (error) {
    const errorType = classifyDbError(error);

    return NextResponse.json(
      {
        status: "error",
        ok: false,
        errorType,
        message:
          errorType === "network_unstable"
            ? "数据库网络连接不稳定（可能是 Neon 链路抖动）"
            : errorType === "schema_not_initialized"
              ? "数据库表未初始化，请先访问 /api/init-db"
              : "数据库连接异常",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        database: "neon-postgresql",
      },
      { status: 503 }
    );
  }
}
