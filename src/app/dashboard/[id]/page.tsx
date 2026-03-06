"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getQRDetail } from "@/lib/api-client";
import { formatQRNumber, formatDateTime, formatHierarchyLounei, formatHierarchyWaibu } from "@/lib/format";
import { formatForPrint } from "@/lib/encode";
import type { QRCodeRecord, SubmissionRecord } from "@/lib/types";

export default function DashboardDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [qrCode, setQrCode] = useState<QRCodeRecord | null>(null);
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await getQRDetail(id);
        setQrCode(data.qrCode);
        setSubmission(data.submission);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleCopy = async () => {
    if (!submission) return;
    try {
      const text = formatForPrint(submission.formData);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-slate-500">加载中...</div>
      </div>
    );
  }

  if (error || !qrCode) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="rounded-lg bg-red-50 text-red-700 p-4 mb-4">
          {error || "二维码不存在"}
        </div>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          返回列表
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-4"
        >
          <span className="mr-2">←</span>
          返回列表
        </Link>
      </div>

      <div className="space-y-6">
        {/* 二维码基本信息 */}
        <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">二维码信息</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">编号:</span>
              <span className="font-bold text-blue-600 text-xl">
                {formatQRNumber(qrCode.number)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">类型:</span>
              <span className="font-medium text-slate-800">
                {qrCode.type === "neibu" ? "🏥 楼内送药" : "🚚 外送送药"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">创建时间:</span>
              <span className="text-slate-800">{formatDateTime(qrCode.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">状态:</span>
              {submission ? (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  已填写
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                  待填写
                </span>
              )}
            </div>
          </div>
          <div className="mt-6">
            <Link
              href={`/dashboard/${qrCode.id}/download`}
              className="block w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-center rounded-lg transition-colors"
            >
              下载二维码图片
            </Link>
          </div>
        </div>

        {/* 客户提交信息 */}
        {submission ? (
          <>
            <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">客户信息</h2>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                >
                  {copied ? "已复制!" : "复制全部内容"}
                </button>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                {formatForPrint(submission.formData)}
              </div>
              <div className="mt-3 text-xs text-slate-500">
                提交时间: {formatDateTime(submission.submittedAt)}
              </div>
            </div>

            {/* 字段层级结构 */}
            <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">字段层级结构</h2>
              <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-slate-700">
                {submission.formData.type === "楼内送药"
                  ? formatHierarchyLounei(submission.formData)
                  : formatHierarchyWaibu(submission.formData)}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-white p-8 shadow-lg border border-slate-200 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-slate-600">客户尚未填写此二维码</p>
          </div>
        )}
      </div>
    </div>
  );
}
