import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">扫码表单系统</h1>
      <p className="text-slate-600 mb-10">请选择送药类型，生成二维码后分享给用户填写</p>
      <div className="grid gap-6 w-full max-w-sm">
        <Link
          href="/share/neibu"
          className="block p-6 rounded-xl bg-white border-2 border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all text-center"
        >
          <span className="text-4xl mb-2 block">🏥</span>
          <span className="text-xl font-semibold text-slate-800">楼内送药</span>
          <p className="text-sm text-slate-500 mt-1">点击生成二维码，分享给用户</p>
        </Link>
        <Link
          href="/share/waibu"
          className="block p-6 rounded-xl bg-white border-2 border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all text-center"
        >
          <span className="text-4xl mb-2 block">🚚</span>
          <span className="text-xl font-semibold text-slate-800">外送送药</span>
          <p className="text-sm text-slate-500 mt-1">点击生成二维码，分享给用户</p>
        </Link>
      </div>
      <Link
        href="/decode"
        className="mt-12 text-slate-500 hover:text-slate-700 text-sm underline"
      >
        扫描用户发回的二维码（上传图片识别）→
      </Link>
    </main>
  );
}
