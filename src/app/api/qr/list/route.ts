import { NextResponse } from "next/server";
import type {
  QRListItem,
  SubmissionPreview,
  LouneiSongyaoPayload,
  WaibuSongyaoPayload,
} from "@/lib/types";
import { getQRList, hasSubmission, getSubmission } from "@/lib/db";

export const dynamic = "force-dynamic";

function buildSubmissionPreview(
  formData: LouneiSongyaoPayload | WaibuSongyaoPayload
): SubmissionPreview | null {
  const name = formData.name?.trim() || "";
  const phone = formData.phone?.trim() || "";
  if (!name && !phone) return null;
  let summary: string | undefined;
  if (formData.type === "楼内送药") {
    const floor = formData.floor || "";
    const room = formData.room || "";
    if (floor || room) summary = [floor, room].filter(Boolean).join(" ");
  } else if (formData.type === "外送送药") {
    const community = formData.community || "";
    const street = formData.street || "";
    summary = community || street || undefined;
  }
  return { name, phone, summary };
}

export async function GET() {
  try {
    const records = await getQRList();

    const listItems: QRListItem[] = await Promise.all(
      records.map(async (record) => {
        const submitted = await hasSubmission(record.id);
        let submissionPreview: SubmissionPreview | null = null;
        if (submitted) {
          const sub = await getSubmission(record.id);
          if (sub?.formData) submissionPreview = buildSubmissionPreview(sub.formData);
        }
        return {
          id: record.id,
          number: record.number,
          type: record.type,
          createdAt: record.createdAt,
          hasSubmission: submitted,
          submissionPreview,
        };
      })
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
