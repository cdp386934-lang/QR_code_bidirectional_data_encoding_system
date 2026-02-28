"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface ShareQRProps {
  type: "neibu" | "waibu";
}

export default function ShareQR({ type }: ShareQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const formUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/form/${type}`
        : `https://example.com/form/${type}`;

    QRCode.toCanvas(canvasRef.current, formUrl, {
      width: 260,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).catch((err) => {
      setError(String(err));
    });
  }, [type]);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 text-red-700 p-4">
        生成二维码失败：{error}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
      <canvas ref={canvasRef} className="rounded-lg" />
      <p className="mt-4 text-sm text-slate-500 text-center">
        用户扫码后将进入 {type === "neibu" ? "楼内送药" : "外送送药"} 表单
      </p>
    </div>
  );
}
