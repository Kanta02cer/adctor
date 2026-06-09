"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ExternalLink, Copy, AlertCircle, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ api_key: string; account_link_url: string; mode?: string; notice?: string } | null>(null);
  const [error, setError] = useState("");
  const [price, setPrice] = useState("800");
  const [priceSaved, setPriceSaved] = useState(false);

  const startOnboarding = async () => {
    if (!email || !domain) { setError("メールアドレスとドメインを入力してください"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/connect/onboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, domain }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally { setLoading(false); }
  };

  const savePrice = async () => {
    if (!result?.api_key) return;
    try {
      await fetch(`${API_BASE}/api/v1/publisher/price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: result.api_key, price_jpy: parseInt(price) }),
      });
      setPriceSaved(true);
      setTimeout(() => setPriceSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">設定</h1>
        <p className="text-sm text-white/40 mt-0.5">Stripe Connect連携とアクセス単価の管理</p>
      </div>

      {/* Stripe Connect Onboarding */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-sm text-white/70 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B89F5D]" />
            Stripe Connect 連携（銀行口座登録）
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result ? (
            <>
              <p className="text-xs text-white/50">
                Stripeの安全なページで銀行口座を登録します。登録後、AIクローラーの決済が自動的にあなたの口座へ振り込まれます。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">メールアドレス</label>
                  <input
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-[#B89F5D]/50 outline-none placeholder:text-white/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">サイトドメイン</label>
                  <input
                    value={domain} onChange={e => setDomain(e.target.value)}
                    placeholder="example.co.jp"
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-[#B89F5D]/50 outline-none placeholder:text-white/20"
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3" /> {error}
                </div>
              )}
              <button
                onClick={startOnboarding} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#B89F5D] text-black text-sm font-semibold rounded-lg hover:bg-[#B89F5D]/90 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Stripeで銀行口座を登録する →
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {/* Demo mode notice */}
              {result.mode === "demo" ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs font-semibold">⚠ デモモードで動作中</span>
                  </div>
                  <p className="text-xs text-amber-300/70">
                    Stripe Connectが未有効のため、デモモードで登録されました。本番運用するには{" "}
                    <a href="https://dashboard.stripe.com/connect" target="_blank" rel="noopener noreferrer"
                      className="underline text-amber-400 hover:text-amber-300">Stripeダッシュボード</a>{" "}
                    でConnectを有効化してください。
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-[#B89F5D]/10 border border-[#B89F5D]/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#B89F5D]" />
                  <span className="text-xs text-[#B89F5D]">アカウントが作成されました。Stripeで銀行口座の登録を完了してください。</span>
                </div>
              )}
              <div>
                <p className="text-xs text-white/50 mb-1">あなたのAPIキー（サイトに設置するタグに使用）</p>
                <div className="flex items-center gap-2 bg-black border border-white/10 rounded px-3 py-2">
                  <code className="text-sm font-mono text-[#B89F5D] flex-1">{result.api_key}</code>
                  <button onClick={() => navigator.clipboard.writeText(result.api_key)}>
                    <Copy className="w-3 h-3 text-white/40 hover:text-white" />
                  </button>
                </div>
              </div>
              {result.mode !== "demo" && (
                <a
                  href={result.account_link_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#635bff] text-white text-sm font-semibold rounded-lg hover:bg-[#635bff]/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Stripeで銀行口座の登録を完了する
                </a>
              )}
              {result.mode !== "demo" && (
                <p className="text-xs text-white/30 text-center">登録完了後、このページに自動的に戻ります</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price setting */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-sm text-white/70">アクセス単価設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-white/40 mb-1">設定単価</p>
              <p className="text-lg font-bold text-white">¥{parseInt(price).toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <p className="text-white/40 mb-1">プラットフォーム手数料 (20%)</p>
              <p className="text-lg font-bold text-white/50">¥{Math.round(parseInt(price) * 0.2).toLocaleString()}</p>
            </div>
            <div className="bg-[#B89F5D]/5 border border-[#B89F5D]/20 rounded-lg p-3 text-center">
              <p className="text-[#B89F5D]/80 mb-1">あなたの受取額 (80%)</p>
              <p className="text-lg font-bold text-[#B89F5D]">¥{Math.round(parseInt(price) * 0.8).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-black border border-white/10 rounded px-3 py-2">
              <span className="text-sm text-white/60">¥</span>
              <input
                type="number" value={price} onChange={e => setPrice(e.target.value)} min="100"
                className="flex-1 bg-transparent text-white text-sm outline-none"
              />
              <span className="text-xs text-white/30">/ クロール</span>
            </div>
            <button
              onClick={savePrice}
              className="px-4 py-2 bg-[#B89F5D]/10 border border-[#B89F5D]/20 text-[#B89F5D] text-sm rounded-lg hover:bg-[#B89F5D]/20 transition-colors flex items-center gap-1"
            >
              {priceSaved ? <><CheckCircle2 className="w-4 h-4" /> 保存済み</> : "保存する"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Fee structure info */}
      <Card className="glass-panel">
        <CardContent className="p-5">
          <p className="text-xs text-white/50 mb-3">収益分配の仕組み</p>
          <div className="space-y-2 text-xs">
            {[
              ["AIクローラーが支払う金額", `¥${parseInt(price).toLocaleString()}`, "text-white"],
              ["Stripe決済手数料（約3.6%）", `▲ ¥${Math.round(parseInt(price) * 0.036).toLocaleString()}`, "text-white/50"],
              ["Adctorプラットフォーム手数料（20%）", `▲ ¥${Math.round(parseInt(price) * 0.2).toLocaleString()}`, "text-white/50"],
              ["あなたの実受取額", `≈ ¥${Math.round(parseInt(price) * 0.764).toLocaleString()}`, "text-[#B89F5D]"],
            ].map(([label, val, cls]) => (
              <div key={label as string} className="flex justify-between">
                <span className="text-white/40">{label}</span>
                <span className={`font-medium ${cls}`}>{val}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
