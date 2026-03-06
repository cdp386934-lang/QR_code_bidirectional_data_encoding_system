"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getQRCodeById } from "@/lib/api-client";
import { formatQRNumber } from "@/lib/format";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import type { QRCodeRecord } from "@/lib/types";

export default function DownloadQRPage() {
  const params = useParams();
  const id = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [record, setRecord] = useState<QRCodeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecord() {
      try {
        setLoading(true);
        const data = await getQRCodeById(id);
        if (!data.record) {
          setError("二维码不存在");
          return;
        }
        setRecord(data.record);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    }

    loadRecord();
  }, [id]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current || !record) return;

    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `二维码_${formatQRNumber(record.number)}_${record.type}.png`;
    link.href = url;
    link.click();
  }, [record]);

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-slate-50">
        <div className="max-w-md mx-auto text-center text-slate-500">
          加载中...
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen py-8 px-4 bg-slate-50">
        <div className="max-w-md mx-auto">
          <div className="rounded-lg bg-red-50 text-red-700 p-4 mb-4">
            {error || "二维码不存在"}
          </div>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline text-sm"
          >
            ← 返回列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-slate-50">
      <div className="max-w-md mx-auto">
        <Link
          href="/dashboard"
          className="inline-block mb-6 text-slate-500 hover:text-slate-700 text-sm"
        >
          ← 返回列表
        </Link>

        <h1 className="text-xl font-bold text-slate-800 mb-2">
          下载二维码 - {formatQRNumber(record.number)}
        </h1>
        <p className="text-slate-600 mb-6">
          {record.type === "neibu" ? "楼内送药" : "外送送药"}
        </p>

        <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex flex-col items-center">
            <QRCodeGenerator
              qrId={record.id}
              qrNumber={record.number}
              type={record.type}
              onGenerated={(canvas) => {
                // Canvas 已生成，可以下载
                canvasRef.current = canvas;
              }}
            />
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-slate-800">
                {formatQRNumber(record.number)}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                用户扫码后将进入{" "}
                {record.type === "neibu" ? "楼内送药" : "外送送药"} 表单
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              保存图片
            </button>
            <Link
              href={`/dashboard/${record.id}`}
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-center"
            >
              查看详情
            </Link>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 提示：这是已有的二维码 {formatQRNumber(record.number)}，不会创建新的编号
          </p>
        </div>
      </div>
    </div>
  );
}
