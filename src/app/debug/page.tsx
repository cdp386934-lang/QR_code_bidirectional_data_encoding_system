"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [info, setInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    setInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: String(window.screen.width),
      screenHeight: String(window.screen.height),
      windowWidth: String(window.innerWidth),
      windowHeight: String(window.innerHeight),
      isWeChat: /MicroMessenger/i.test(navigator.userAgent) ? "是" : "否",
      origin: window.location.origin,
      href: window.location.href,
    });
  }, []);

  return (
    <main className="min-h-screen p-4 bg-slate-50">
      <h1 className="text-xl font-bold mb-4">调试信息</h1>
      <div className="bg-white rounded-lg p-4 space-y-2">
        {Object.entries(info).map(([key, value]) => (
          <div key={key} className="border-b pb-2">
            <div className="text-sm text-slate-600">{key}</div>
            <div className="text-sm font-mono break-all">{value}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
