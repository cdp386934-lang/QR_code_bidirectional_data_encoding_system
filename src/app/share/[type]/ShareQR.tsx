"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { createQRCode } from "@/lib/api-client";
import { formatQRNumber } from "@/lib/format";
import type { QRCodeRecord } from "@/lib/types";

interface ShareQRProps {
  type: "neibu" | "waibu";
}

const QR_SIZE = 280;
const NUMBER_BAR_HEIGHT = 40;

export default function ShareQR({ type }: ShareQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrRecord, setQrRecord] = useState<QRCodeRecord | null>(null);

  // 创建记录后，在 canvas 挂载后绘制（避免 loading 时 canvas 未渲染导致 ref 为 null）
  useEffect(() => {
    if (!qrRecord || !canvasRef.current) return;

    const formUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/form/${type}?qr=${qrRecord.id}`
        : `https://example.com/form/${type}?qr=${qrRecord.id}`;

    let cancelled = false;

    (async () => {
      try {
        const offscreen = document.createElement("canvas");
        offscreen.width = QR_SIZE;
        offscreen.height = QR_SIZE;
        await QRCode.toCanvas(offscreen, formUrl, {
          width: QR_SIZE,
          margin: 2,
          color: { dark: "#0f172a", light: "#ffffff" },
        });

        if (cancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        canvas.width = QR_SIZE;
        canvas.height = QR_SIZE + NUMBER_BAR_HEIGHT;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(0, 0, QR_SIZE, NUMBER_BAR_HEIGHT);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 18px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(formatQRNumber(qrRecord.number), QR_SIZE / 2, NUMBER_BAR_HEIGHT / 2);
          ctx.drawImage(offscreen, 0, NUMBER_BAR_HEIGHT, QR_SIZE, QR_SIZE);
        }
      } catch (err) {
        console.error("绘制二维码失败:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [qrRecord, type]);

  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);
      const record = await createQRCode(type);
      setQrRecord(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

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
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 text-red-700 p-4">
          生成二维码失败：{error}
        </div>
        <button
          onClick={generateQR}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          重新生成二维码
        </button>
      </div>
    );
  }

  if (!qrRecord) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-slate-600 text-center">
            <p className="text-lg mb-2">点击下方按钮生成新的二维码</p>
            <p className="text-sm text-slate-500">每次生成都会创建一个新的编号</p>
          </div>
          <button
            onClick={generateQR}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            生成新二维码
          </button>
        </div>
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
            onClick={generateQR}
            className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            生成新二维码
          </button>
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
