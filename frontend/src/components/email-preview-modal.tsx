"use client";
import { useState, useEffect } from "react";
import { X, Mail, CheckCircle2, ExternalLink } from "lucide-react";
import { emailStore, type EmailPreview } from "@/lib/adctor-services";

export function EmailPreviewModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState<EmailPreview | null>(null);

  useEffect(() => {
    const unsub = emailStore.subscribe(emails => setEmail(emails[0] ?? null));
    return unsub;
  }, []);

  if (!email) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}>
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#B89F5D]/15 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#B89F5D]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">メール送信完了（プレビュー）</p>
              <p className="text-xs text-white/30">実際のメール送信にはResend APIキーを設定してください</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* メールメタ情報 */}
        <div className="px-6 py-3 bg-[#0a0a0a] border-b border-white/5 space-y-1">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/30 w-12">From</span>
            <span className="text-white/60">Adctor &lt;noreply@adctor.jp&gt;</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/30 w-12">To</span>
            <span className="text-[#B89F5D]">{email.to}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/30 w-12">件名</span>
            <span className="text-white">{email.subject}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/30 w-12">送信</span>
            <span className="text-white/40">{email.sentAt.toLocaleString("ja-JP")}</span>
          </div>
        </div>

        {/* メール本文プレビュー */}
        <div className="p-6">
          <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden max-h-96 overflow-y-auto">
            <iframe
              srcDoc={email.html}
              className="w-full"
              style={{ height: "380px", border: "none" }}
              title="メールプレビュー"
            />
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <p className="text-xs text-white/20">
            💡 本番環境では <code className="text-white/40">RESEND_API_KEY</code> を設定すると実際にメールが届きます
          </p>
          <button onClick={onClose}
            className="px-4 py-2 bg-[#B89F5D] text-black text-sm font-bold rounded-lg hover:bg-[#B89F5D]/90 transition-colors">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
