"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

function ReturnContent() {
  const params = useSearchParams();
  const apiKey = params.get("api_key");
  const isDemo = params.get("demo") === "true";
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");

  useEffect(() => {
    if (!apiKey) { setStatus("error"); return; }
    if (isDemo) { setStatus("success"); return; }

    fetch(`${API_BASE}/api/v1/connect/status/${apiKey}`)
      .then(r => r.json())
      .then(data => setStatus(data.onboarded ? "success" : "pending"))
      .catch(() => setStatus("error"));
  }, [apiKey, isDemo]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <><Loader2 className="w-12 h-12 text-[#B89F5D] mx-auto animate-spin" />
          <p className="text-white/50 text-sm">確認中...</p></>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 text-[#B89F5D] mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-white">Stripe連携が完了しました</h1>
              <p className="text-white/50 text-sm mt-2">
                AIクローラーからの収益が自動的にあなたの銀行口座へ振り込まれます。
              </p>
            </div>
            {apiKey && (
              <div className="bg-[#B89F5D]/10 border border-[#B89F5D]/20 rounded-lg p-4">
                <p className="text-xs text-white/50 mb-1">あなたのAPIキー</p>
                <code className="text-lg font-mono font-bold text-[#B89F5D]">{apiKey}</code>
                <p className="text-xs text-white/30 mt-1">このキーをサイトの導入タグに設定してください</p>
              </div>
            )}
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#B89F5D] text-black font-semibold rounded-lg hover:bg-[#B89F5D]/90 transition-colors">
              ダッシュボードへ →
            </Link>
          </>
        )}
        {status === "pending" && (
          <>
            <XCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <div>
              <h1 className="text-xl font-bold text-white">登録がまだ完了していません</h1>
              <p className="text-white/50 text-sm mt-2">Stripeでの銀行口座登録を完了させてください。</p>
            </div>
            <Link href="/dashboard/settings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
              設定に戻る
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            <p className="text-white/50 text-sm">エラーが発生しました。</p>
            <Link href="/dashboard/settings" className="text-[#B89F5D] text-sm">設定に戻る</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConnectReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#B89F5D] animate-spin" /></div>}>
      <ReturnContent />
    </Suspense>
  );
}
