import Link from "next/link";
import FormContainer from "./FormContainer";
import type { FormType } from "@/lib/types";

const TITLES: Record<FormType, string> = {
  neibu: "楼内送药",
  waibu: "外送送药",
};

const TYPES = ["neibu", "waibu"] as const;

export function generateStaticParams() {
  return TYPES.map((type) => ({ type }));
}

interface FormPageProps {
  params: { type: string };
}

export default function FormPage({ params }: FormPageProps) {
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
      <FormContainer type={type as FormType} />
    </main>
  );
}
