"use client";

import { useState } from "react";

export default function TestFormPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("提交:", { name, phone });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">提交成功!</h1>
          <p className="text-slate-600">姓名: {name}</p>
          <p className="text-slate-600">电话: {phone}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">测试表单</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              姓名 *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              电话 *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="请输入电话"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-slate-800 text-white font-medium"
          >
            提交
          </button>
        </form>
        <div className="mt-4 text-xs text-slate-500 bg-white p-3 rounded">
          <div>User Agent: {navigator.userAgent}</div>
        </div>
      </div>
    </div>
  );
}
