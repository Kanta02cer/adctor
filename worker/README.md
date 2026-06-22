# Adctor Gateway — Cloudflare Worker

AIクローラーを検知してHTTP 402で課金する、Cloudflare Workers製のゲートウェイ。

> 注意: このWorkerはPPC検証用のプロトタイプです。本番決済、精算、分配、返金、税務、規約対応には、決済専門家・法務・税務レビューが必要です。Hackall初期版では、まず402候補判定、価格ルール、イベント台帳、監査ログとして扱います。

## 仕組み

```
AIクローラー → Cloudflare Worker → [AI判定]
                                    ├─ 人間/ホワイトリスト → オリジンへ透過
                                    ├─ AI + 有効トークン → オリジンへ透過
                                    └─ AI + トークンなし → 402 + Stripe URL
```

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. Wrangler ログイン
```bash
npx wrangler login
```

### 3. KV Namespace の作成
```bash
npx wrangler kv namespace create TOKENS
# → IDをwrangler.tomlの[[kv_namespaces]]に設定
```

### 4. シークレットの設定
```bash
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put STRIPE_CONNECTED_ACCOUNT_ID
npx wrangler secret put ORIGIN_URL
```

### 5. ローカル開発
```bash
cp .dev.vars.example .dev.vars
# .dev.varsを編集してキーを記入
npx wrangler dev
```

### 6. 本番デプロイ
```bash
npx wrangler deploy
```

## Stripe Webhook の設定

デプロイ後、StripeダッシュボードでWebhookを設定：
- URL: `https://adctor-gateway.YOUR_SUBDOMAIN.workers.dev/_adctor/webhook`
- イベント: `checkout.session.completed`

## ローカルテスト

```bash
# 通常のリクエスト（スルー）
curl -H "User-Agent: Mozilla/5.0" http://localhost:8787/

# AIクローラーのシミュレーション（402が返る）
curl -v -H "User-Agent: GPTBot/1.0" http://localhost:8787/

# 有効トークンでのアクセス（スルー）
curl -H "User-Agent: GPTBot/1.0" -H "X-Adctor-Token: YOUR_TOKEN" http://localhost:8787/
```
