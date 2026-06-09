"use client";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const token = params.get("token");
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <CheckCircle2 className="w-16 h-16 text-[#B89F5D] mx-auto" />
        <div>
          <h1 className="text-2xl font-bold text-white">決済完了</h1>
          <p className="text-white/50 text-sm mt-2">コンテンツへのアクセスが1時間許可されました。</p>
        </div>
        {token && (
          <div className="bg-black border border-white/10 rounded-lg p-3">
            <p className="text-xs text-white/30 mb-1">アクセストークン</p>
            <code className="text-xs font-mono text-[#00CCFF] break-all">{token}</code>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f]" />}>
      <SuccessContent />
    </Suspense>
  );
}
