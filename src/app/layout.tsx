import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "扫码表单系统",
  description: "楼内送药 / 外送送药",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
