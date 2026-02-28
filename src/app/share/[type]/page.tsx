import Link from "next/link";
import ShareQR from "./ShareQR";
import type { FormType } from "@/lib/types";

const TITLES: Record<FormType, string> = {
  neibu: "楼内送药",
  waibu: "外送送药",
};

const TYPES = ["neibu", "waibu"] as const;

export function generateStaticParams() {
  return TYPES.map((type) => ({ type }));
}

interface SharePageProps {
  params: { type: string };
}

export default function SharePage({ params }: SharePageProps) {
  const { type } = params;
  if (type !== "neibu" && type !== "waibu") {
    return (
      <main className="min-h-screen py-8 px-4 bg-slate-50">
        <p className="text-red-600">无效的送药类型</p>
        <Link href="/" className="text-slate-600 hover:underline mt-2 inline-block">
          返回首页
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-slate-50">
      <Link href="/" className="inline-block mb-6 text-slate-500 hover:text-slate-700 text-sm">
        ← 返回首页
      </Link>
      <h1 className="text-xl font-bold text-slate-800 mb-2">{TITLES[type]} - 分享二维码</h1>
      <p className="text-slate-600 mb-6">
        将下方二维码展示给用户扫码，用户将进入对应表单填写信息
      </p>
      <ShareQR type={type} />
    </main>
  );
}
