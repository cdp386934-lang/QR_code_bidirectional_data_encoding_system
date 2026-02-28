import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "扫码表单系统",
  description: "楼内送药 / 外送送药",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
