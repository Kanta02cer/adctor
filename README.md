# Adctor — AIクローラー収益化プラットフォーム

AIクローラー（GPTBot、ClaudeBot等）がサイトをアクセスした際に、Stripe決済を経由して収益を受け取るプラットフォームです。

## アーキテクチャ

```
[AIクローラー] → [Adctor Gateway API] → [Stripe Checkout] → [収益自動分配]
                       ↕
              [Adctor ダッシュボード]
```

## セットアップ

### 必要なもの
- Python 3.12+
- Node.js 18+
- Stripeアカウント（テストキー）

### 1. バックエンド

```bash
cd backend
cp .env.example .env
# .env に Stripe テストキーを設定済み

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. フロントエンド

```bash
cd frontend
npm install
npm run dev
```

### 3. Webhook（本番 / ローカルテスト）

```bash
# Stripe CLI をインストール後:
stripe login
stripe listen --forward-to localhost:8000/api/v1/webhook/stripe
# → 表示された whsec_... を backend/.env の STRIPE_WEBHOOK_SECRET に設定
```

## Stripe Connect 有効化

現時点ではStripe Connectが未設定のためデモモードで動作します。
本番運用するには:

1. [Stripe Dashboard → Connect](https://dashboard.stripe.com/connect) で Connect を有効化
2. 完了後、設定ページ (`/dashboard/settings`) から銀行口座を登録

## APIエンドポイント

| エンドポイント | 説明 |
|---|---|
| `POST /api/v1/connect/onboard` | Stripe Express アカウント作成 + KYC URL |
| `GET /api/v1/connect/status/{api_key}` | オンボーディング状態確認 |
| `POST /api/v1/check-access` | AIボット検知 → 402 + Checkout URL |
| `POST /api/v1/webhook/stripe` | Webhook → トークン発行・収益分配 |
| `POST /api/v1/publisher/price` | クロール単価更新 |
| `GET /api/v1/stats/{api_key}` | ダッシュボード統計 |

## 環境変数

### backend/.env
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
BASE_URL=http://localhost:3000
```

### frontend/.env.local
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

## デモフロー

1. ダッシュボード: `http://localhost:3000/dashboard`
2. 設定→APIキー発行: `http://localhost:3000/dashboard/settings`
3. デモ決済: `http://localhost:3000/payment/demo?session=test&token=demo`
4. 収益確認: ダッシュボードの統計カード

## 収益分配

- AIクローラーの支払い: ¥800（デフォルト、変更可）
- Adctorプラットフォーム手数料: 20%
- Stripe決済手数料: 約3.6%
- **サイト運営者の実受取: 約76.4%**
