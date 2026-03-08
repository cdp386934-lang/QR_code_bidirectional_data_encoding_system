"use client";

import { useState, useEffect } from "react";
import { submitForm } from "@/lib/api-client";
import type {
  FormType,
  LouneiSongyaoPayload,
  WaibuSongyaoPayload,
} from "@/lib/types";

const TITLES: Record<FormType, string> = {
  neibu: "楼内送药",
  waibu: "外送送药",
};

interface FormContainerProps {
  type: FormType;
  qrCodeId?: string;
}

export default function FormContainer({ type, qrCodeId: initialQrCodeId }: FormContainerProps) {
  const [qrCodeId, setQrCodeId] = useState<string | null>(initialQrCodeId || null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waibuError, setWaibuError] = useState<string | null>(null);

  useEffect(() => {
    console.log("QR Code ID:", initialQrCodeId);
    console.log("User Agent:", navigator.userAgent);
    if (initialQrCodeId) {
      setQrCodeId(initialQrCodeId);
    }
  }, [initialQrCodeId]);

  const handleSubmitLounei = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!qrCodeId) {
      setError("无效的二维码");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      const data: LouneiSongyaoPayload = {
        type: "楼内送药",
        name: String(fd.get("name") ?? "").trim(),
        phone: String(fd.get("phone") ?? "").trim(),
        hospital: String(fd.get("hospital") ?? "").trim(),
        building: String(fd.get("building") ?? "").trim(),
        floor: String(fd.get("floor") ?? "").trim(),
        department: String(fd.get("department") ?? "").trim(),
        room: String(fd.get("room") ?? "").trim(),
        bed: String(fd.get("bed") ?? "").trim(),
        timestamp: new Date().toISOString(),
      };

      await submitForm(qrCodeId, data);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitWaibu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!qrCodeId) {
      setError("无效的二维码");
      return;
    }

    setWaibuError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const community = String(fd.get("community") ?? "").trim();
    const street = String(fd.get("street") ?? "").trim();
    if (!community && !street) {
      setWaibuError("小区名称和街道号必须至少填写一个；没有小区名时必须填写街道号");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data: WaibuSongyaoPayload = {
        type: "外送送药",
        name: String(fd.get("name") ?? "").trim(),
        phone: String(fd.get("phone") ?? "").trim(),
        community,
        street,
        building: String(fd.get("building") ?? "").trim(),
        unit: String(fd.get("unit") ?? "").trim(),
        floor: String(fd.get("floor") ?? "").trim(),
        room: String(fd.get("room") ?? "").trim(),
        timestamp: new Date().toISOString(),
      };

      await submitForm(qrCodeId, data);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (!qrCodeId) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-xl bg-yellow-50 p-8 shadow-lg border border-yellow-200">
          <div className="text-4xl mb-4 text-center">⚠️</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2 text-center">
            无效的二维码
          </h1>
          <p className="text-slate-600 text-center mb-4">
            请通过扫描二维码访问此页面
          </p>
          <div className="text-xs text-slate-500 bg-white p-3 rounded border border-slate-200 font-mono break-all">
            <div>当前 URL: {typeof window !== "undefined" ? window.location.href : ""}</div>
            <div className="mt-2">User Agent: {typeof navigator !== "undefined" ? navigator.userAgent : ""}</div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-xl bg-white p-8 shadow-lg border border-slate-200 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">提交成功!</h1>
          <p className="text-slate-600 mb-6">
            您的信息已成功提交，感谢您的配合！
          </p>
          <p className="text-sm text-slate-500">
            业务员将会根据您提供的信息进行处理
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-lg bg-red-50 text-red-700 p-4 mb-4">
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 px-4 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
        >
          重新尝试
        </button>
      </div>
    );
  }

  if (type === "neibu") {
    const hospitals = ["人民医院", "中医院", "市立医院"];
    const buildings = Array.from({ length: 10 }, (_, i) => `${i + 1}号楼`);
    const floors = Array.from({ length: 20 }, (_, i) => `${i + 1}层`);
    const departments = ["内科", "外科", "儿科", "心内科", "骨科"];
    const rooms = Array.from({ length: 20 }, (_, i) => String(101 + i));
    const beds = Array.from({ length: 4 }, (_, i) => `${i + 1}号床`);

    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-bold text-slate-800 mb-6">{TITLES.neibu} 表单</h1>
        <form
          onSubmit={handleSubmitLounei}
          className="rounded-xl bg-white p-6 shadow-lg border border-slate-200 space-y-4"
        >
          <div>
            <span className="block text-sm font-medium text-slate-700 mb-2">基本信息</span>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  姓名 *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  电话 *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                  placeholder="请输入电话"
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-amber-700 bg-amber-50 py-2 px-3 rounded-lg border border-amber-200">
            ----下方为父子级关系，请电话沟通确认----
          </p>

          <div>
            <label htmlFor="hospital" className="block text-sm font-medium text-slate-700 mb-1">
              医院
            </label>
            <select
              id="hospital"
              name="hospital"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 bg-white"
            >
              <option value="">请选择</option>
              {hospitals.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="building" className="block text-sm font-medium text-slate-700 mb-1">
              几号楼
            </label>
            <select
              id="building"
              name="building"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 bg-white"
            >
              <option value="">请选择</option>
              {buildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-slate-700 mb-1">
              楼层
            </label>
            <select
              id="floor"
              name="floor"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 bg-white"
            >
              <option value="">请选择</option>
              {floors.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1">
              科室
            </label>
            <select
              id="department"
              name="department"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 bg-white"
            >
              <option value="">请选择</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="room" className="block text-sm font-medium text-slate-700 mb-1">
              病房号
            </label>
            <select
              id="room"
              name="room"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 bg-white"
            >
              <option value="">请选择</option>
              {rooms.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bed" className="block text-sm font-medium text-slate-700 mb-1">
              病床号
            </label>
            <select
              id="bed"
              name="bed"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 bg-white"
            >
              <option value="">请选择</option>
              {beds.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "提交中..." : "确认"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-6">{TITLES.waibu} 表单</h1>
      <form
        onSubmit={handleSubmitWaibu}
        className="rounded-xl bg-white p-6 shadow-lg border border-slate-200 space-y-4"
      >
        <div>
          <label htmlFor="waibu-name" className="block text-sm font-medium text-slate-700 mb-1">
            姓名 *
          </label>
          <input
            id="waibu-name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            placeholder="请输入姓名"
          />
        </div>
        <div>
          <label htmlFor="waibu-phone" className="block text-sm font-medium text-slate-700 mb-1">
            电话 *
          </label>
          <input
            id="waibu-phone"
            name="phone"
            type="tel"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            placeholder="请输入电话"
          />
        </div>
        <div>
          <label htmlFor="community" className="block text-sm font-medium text-slate-700 mb-1">
            小区名称
          </label>
          <input
            id="community"
            name="community"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            placeholder="如：松浦观江国际"
          />
        </div>
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-slate-700 mb-1">
            街道号
          </label>
          <input
            id="street"
            name="street"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            placeholder="无小区名时必填"
          />
        </div>
        <div>
          <label htmlFor="waibu-building" className="block text-sm font-medium text-slate-700 mb-1">
            楼栋
          </label>
          <input
            id="waibu-building"
            name="building"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            placeholder="请输入楼栋"
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-slate-700 mb-1">
            单元门
          </label>
          <input
            id="unit"
            name="unit"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            placeholder="请输入单元门"
          />
        </div>
        <div>
          <label htmlFor="waibu-floor" className="block text-sm font-medium text-slate-700 mb-1">
            楼层
          </label>
          <input
            id="waibu-floor"
            name="floor"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            placeholder="请输入楼层"
          />
        </div>
        <div>
          <label htmlFor="waibu-room" className="block text-sm font-medium text-slate-700 mb-1">
            门牌号
          </label>
          <input
            id="waibu-room"
            name="room"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            placeholder="请输入门牌号"
          />
        </div>

        <div className="text-sm text-slate-600 bg-slate-50 py-3 px-3 rounded-lg border border-slate-200 space-y-1">
          <p>① 有小区名不需要街道号，没有小区名必须填写街道号；</p>
          <p>② 雷同小区名必须写全名，例如：</p>
          <p className="pl-2 text-slate-500">松浦观江国际</p>
          <p className="pl-2 text-slate-500">群力观江国际</p>
        </div>

        {waibuError && (
          <div className="rounded-lg bg-red-50 text-red-700 py-2 px-3 text-sm">
            {waibuError}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
        >
          确认
        </button>
      </form>
    </div>
  );
}
