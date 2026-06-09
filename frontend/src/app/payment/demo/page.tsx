"use client";
import { useSearchParams } from "next/navigation";
import { Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function DemoContent() {
  const params = useSearchParams();
  const token = params.get("token");
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-8 h-8 text-[#B89F5D]" />
          <span className="text-2xl font-bold text-white">Adctor</span>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <p className="text-xs text-amber-400">デモモード — 実際の決済は発生しません</p>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AIコンテンツアクセス料</h1>
          <p className="text-3xl font-bold text-[#B89F5D] mt-2">¥800</p>
          <p className="text-white/40 text-sm mt-1">1時間のアクセス権</p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-lg p-4 text-left space-y-2">
          {[
            ["対象コンテンツ", "example.co.jp の全ページ"],
            ["検知クローラー", "GPTBot (OpenAI)"],
            ["有効期間", "決済から1時間"],
            ["収益の受取", "サイト運営者へ80%自動分配"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs">
              <span className="text-white/40">{k}</span>
              <span className="text-white/80">{v}</span>
            </div>
          ))}
        </div>
        <Link href={`/payment/success?token=${token}`}
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#635bff] text-white font-semibold rounded-lg hover:bg-[#635bff]/90 transition-colors">
          <CheckCircle2 className="w-4 h-4" />
          デモ決済を完了する（無料）
        </Link>
      </div>
    </div>
  );
}

export default function DemoPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f]" />}>
      <DemoContent />
    </Suspense>
  );
}
