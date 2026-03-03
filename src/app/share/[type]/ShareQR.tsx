"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { createQRCode } from "@/lib/api-client";
import { formatQRNumber } from "@/lib/format";
import type { QRCodeRecord } from "@/lib/types";

interface ShareQRProps {
  type: "neibu" | "waibu";
}

export default function ShareQR({ type }: ShareQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrRecord, setQrRecord] = useState<QRCodeRecord | null>(null);

  useEffect(() => {
    async function generateQR() {
      try {
        setLoading(true);
        setError(null);

        // 调用 API 创建二维码记录
        const record = await createQRCode(type);
        setQrRecord(record);

        // 生成包含 ID 的表单 URL
        const formUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/form/${type}?qr=${record.id}`
            : `https://example.com/form/${type}?qr=${record.id}`;

        if (!canvasRef.current) return;

        // 生成二维码
        await QRCode.toCanvas(canvasRef.current, formUrl, {
          width: 280,
          margin: 2,
          color: { dark: "#0f172a", light: "#ffffff" },
        });

        // 在二维码上方绘制编号
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // 绘制黑色背景条
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(0, 0, canvas.width, 35);

          // 绘制白色编号文字
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 18px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(formatQRNumber(record.number), canvas.width / 2, 17.5);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    }

    generateQR();
  }, [type]);

  const handleSaveImage = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `二维码_${formatQRNumber(qrRecord?.number || 0)}_${type}.png`;
    link.href = url;
    link.click();
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">正在生成二维码...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 text-red-700 p-4">
        生成二维码失败：{error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} className="rounded-lg" />
          {qrRecord && (
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-slate-800">
                {formatQRNumber(qrRecord.number)}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                用户扫码后将进入 {type === "neibu" ? "楼内送药" : "外送送药"} 表单
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSaveImage}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            保存图片
          </button>
          <Link
            href="/dashboard"
            className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-center"
          >
            查看我的二维码
          </Link>
        </div>
      </div>
    </div>
  );
}
