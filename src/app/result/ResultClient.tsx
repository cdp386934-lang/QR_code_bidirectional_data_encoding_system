"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { decodePayload, formatForPrint } from "@/lib/encode";

export default function ResultClient() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const { text, error } = useMemo(() => {
    const d = searchParams.get("d");
    if (!d) return { text: null, error: "缺少参数，请通过二维码或链接访问" };
    try {
      const data = decodePayload(d.trim());
      return { text: formatForPrint(data), error: null };
    } catch (e) {
      return { text: null, error: e instanceof Error ? e.message : "解析失败" };
    }
  }, [searchParams]);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-lg bg-red-50 text-red-700 p-4 mb-4">{error}</div>
        <Link href="/" className="text-slate-600 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-2">送药信息</h1>
      <p className="text-slate-600 mb-4">以下内容可复制给收银系统打印</p>
      <div className="rounded-xl bg-white p-6 shadow-lg border border-slate-200">
        <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 font-sans">
          {text}
        </pre>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
          >
            {copied ? "已复制" : "复制"}
          </button>
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-lg border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors text-center"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
