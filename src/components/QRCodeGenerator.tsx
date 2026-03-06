"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { formatQRNumber } from "@/lib/format";

interface QRCodeGeneratorProps {
  qrId: string;
  qrNumber: number;
  type: "neibu" | "waibu";
  onGenerated?: (canvas: HTMLCanvasElement) => void;
}

/**
 * 可复用的二维码生成组件
 * 根据已有的记录生成二维码图片，不会创建新记录
 */
export default function QRCodeGenerator({
  qrId,
  qrNumber,
  type,
  onGenerated,
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function generateQR() {
      if (!canvasRef.current) return;

      try {
        const formUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/form/${type}?qr=${qrId}`
            : `https://example.com/form/${type}?qr=${qrId}`;

        const qrSize = 280;
        const numberBarHeight = 40;
        const totalHeight = qrSize + numberBarHeight;

        // 离屏 canvas 生成二维码，编号条不遮挡内容
        const offscreen = document.createElement("canvas");
        offscreen.width = qrSize;
        offscreen.height = qrSize;
        await QRCode.toCanvas(offscreen, formUrl, {
          width: qrSize,
          margin: 2,
          color: { dark: "#0f172a", light: "#ffffff" },
        });

        const canvas = canvasRef.current;
        canvas.width = qrSize;
        canvas.height = totalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(0, 0, qrSize, numberBarHeight);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 18px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(formatQRNumber(qrNumber), qrSize / 2, numberBarHeight / 2);
          ctx.drawImage(offscreen, 0, numberBarHeight, qrSize, qrSize);
        }

        onGenerated?.(canvas);
      } catch (err) {
        console.error("生成二维码失败:", err);
      }
    }

    generateQR();
  }, [qrId, qrNumber, type, onGenerated]);

  return <canvas ref={canvasRef} className="rounded-lg" />;
}

/**
 * 下载二维码图片的辅助函数
 */
export function downloadQRCode(
  canvas: HTMLCanvasElement | null,
  qrNumber: number,
  type: string
) {
  if (!canvas) return;

  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `二维码_${formatQRNumber(qrNumber)}_${type}.png`;
  link.href = url;
  link.click();
}
