"use client";

import { useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import { decodePayload, decodeFromResultUrl, formatForPrint, isResultUrl } from "@/lib/encode";

export default function DecodeClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const parseFromUrl = useCallback((urlString: string) => {
    setError(null);
    setText(null);
    const trimmed = urlString.trim();
    if (!trimmed) return;
    if (!isResultUrl(trimmed)) {
      setError("不是有效的结果页链接（需包含 /result?d=...）");
      return;
    }
    try {
      const data = decodeFromResultUrl(trimmed);
      setText(formatForPrint(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "解析链接失败");
    }
  }, []);

  const parseImageFile = useCallback((file: File) => {
    setError(null);
    setText(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("无法创建画布");
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (!code) {
        setError("未识别到二维码或二维码格式不支持");
        return;
      }
      try {
        const data = isResultUrl(code.data) ? decodeFromResultUrl(code.data) : decodePayload(code.data);
        setText(formatForPrint(data));
      } catch (e) {
        setError(e instanceof Error ? e.message : "解析内容失败");
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("图片加载失败");
    };
    img.src = url;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }
    parseImageFile(file);
    e.target.value = "";
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("复制失败");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">粘贴结果页链接（信息在 URL 中）</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onPaste={(e) => {
                const v = e.clipboardData.getData("text").trim();
                if (v) setTimeout(() => parseFromUrl(v), 0);
              }}
              placeholder="https://.../result?d=..."
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            />
            <button
              type="button"
              onClick={() => parseFromUrl(urlInput)}
              className="py-2 px-4 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 whitespace-nowrap"
            >
              解析
            </button>
          </div>
        </div>
        <div className="text-slate-500 text-sm">或</div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-slate-300 text-slate-600 hover:border-slate-500 hover:bg-slate-50 transition-colors"
          >
            上传二维码图片
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 p-4">
          {error}
        </div>
      )}

      {text && (
        <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">解析结果</h2>
          <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 font-sans">
            {text}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
          >
            {copied ? "已复制" : "复制"}
          </button>
        </div>
      )}
    </div>
  );
}
