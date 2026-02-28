import Link from "next/link";
import { Suspense } from "react";
import ResultClient from "./ResultClient";

export default function ResultPage() {
  return (
    <main className="min-h-screen py-8 px-4 bg-slate-50">
      <Link href="/" className="inline-block mb-6 text-slate-500 hover:text-slate-700 text-sm">
        ← 返回首页
      </Link>
      <Suspense fallback={<p className="text-slate-500">加载中…</p>}>
        <ResultClient />
      </Suspense>
    </main>
  );
}
