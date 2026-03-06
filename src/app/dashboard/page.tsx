"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQRList, searchQRByNumber } from "@/lib/api-client";
import { formatQRNumber, formatDate } from "@/lib/format";
import type { QRListItem } from "@/lib/types";

export default function DashboardPage() {
  const [qrList, setQrList] = useState<QRListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchNumber, setSearchNumber] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadQRList();
  }, []);

  const loadQRList = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getQRList();
      setQrList(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(searchNumber, 10);
    if (isNaN(num)) {
      setError("请输入有效的编号");
      return;
    }

    try {
      setSearching(true);
      setError(null);
      const result = await searchQRByNumber(num);
      if (result) {
        // 跳转到详情页
        window.location.href = `/dashboard/${result.id}`;
      } else {
        setError(`未找到编号 ${formatQRNumber(num)} 的二维码`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜索失败");
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchNumber("");
    setError(null);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-slate-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-800">我的二维码</h1>
          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-slate-800 underline"
          >
            返回首页
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
            placeholder="输入编号搜索 (如: 5)"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
          <button
            type="submit"
            disabled={searching || !searchNumber}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searching ? "搜索中..." : "搜索"}
          </button>
          {searchNumber && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
            >
              清除
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      {qrList.length === 0 ? (
        <div className="rounded-xl bg-white p-8 shadow-lg border border-slate-200 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-slate-600 mb-4">还没有生成任何二维码</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            去生成二维码
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {qrList.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white p-4 shadow-md border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/dashboard/${item.id}`}
                  className="flex items-center gap-4 flex-1"
                >
                  <div className="text-2xl font-bold text-blue-600">
                    {formatQRNumber(item.number)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">
                      {item.type === "neibu" ? "🏥 楼内送药" : "🚚 外送送药"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/${item.id}/download`}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    下载二维码
                  </Link>
                  {item.hasSubmission ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      已填写
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                      待填写
                    </span>
                  )}
                </div>
              </div>
              {item.submissionPreview && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">{item.submissionPreview.name}</span>
                  {item.submissionPreview.phone && <span className="ml-2">{item.submissionPreview.phone}</span>}
                  {item.submissionPreview.summary && (
                    <span className="block mt-1 text-slate-500">{item.submissionPreview.summary}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
