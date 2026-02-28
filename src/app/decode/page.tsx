import Link from "next/link";
import DecodeClient from "./DecodeClient";

export default function DecodePage() {
  return (
    <main className="min-h-screen py-8 px-4 bg-slate-50">
      <Link href="/" className="inline-block mb-6 text-slate-500 hover:text-slate-700 text-sm">
        ← 返回首页
      </Link>
      <h1 className="text-xl font-bold text-slate-800 mb-2">扫描用户发回的二维码</h1>
      <p className="text-slate-600 mb-6">
        上传二维码图片或使用摄像头扫描，解析后点击「复制」将文本发送给收银系统打印
      </p>
      <DecodeClient />
    </main>
  );
}
