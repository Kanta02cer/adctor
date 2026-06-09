# システムアーキテクチャ設計書

**プロジェクト名:** Adctor PPCW システム  
**バージョン:** 1.0  
**作成日:** 2026年6月9日

---

## 1. 全体アーキテクチャ図

```
╔══════════════════════════════════════════════════════════════════╗
║                    インターネット                                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  [人間のブラウザ]              [AIクローラー]                        ║
║     Mozilla/5.0                GPTBot/1.0                       ║
║         │                          │                            ║
╠═════════╪══════════════════════════╪═══════════════════════════╣
║         ↓                          ↓                            ║
║  ┌─────────────────────────────────────────────────────────┐   ║
║  │          Cloudflare Edge（世界250拠点）                   │   ║
║  │                                                          │   ║
║  │  ┌──────────────┐  ┌─────────────────┐                 │   ║
║  │  │ Bot Management│  │  Pay-per-Crawl  │                 │   ║
║  │  │  AI UA判定    │  │  HTTP 402生成   │                 │   ║
║  │  │  ASN判定      │  │  KVトークン管理  │                 │   ║
║  │  │  挙動判定     │  │  価格ルール適用  │                 │   ║
║  │  └──────────────┘  └─────────────────┘                 │   ║
║  │         ↓  人間             ↓  AI(未払い)                │   ║
║  │   [オリジンへプロキシ]   [402 + Stripe URL返却]           │   ║
║  │         ↓               ↓  AI(支払済み・トークンあり)     │   ║
║  └─────────│───────────────│───────────────────────────────┘   ║
║            │               │                                    ║
╠════════════╪═══════════════╪════════════════════════════════════╣
║            │               │                                    ║
║  ┌─────────↓───────────────↓──────────────────────────────┐   ║
║  │          AWS (ap-northeast-1 東京リージョン)              │   ║
║  │                                                          │   ║
║  │  ┌────────────────────────────────────────────────┐    │   ║
║  │  │  ECS (FastAPI バックエンド)  Auto Scaling       │    │   ║
║  │  │  - AIクローラー判定API                          │    │   ║
║  │  │  - Stripe Connect API                          │    │   ║
║  │  │  - 価格ルール管理API                            │    │   ║
║  │  │  - Logpush受信・集計                            │    │   ║
║  │  └────────────────────────────────────────────────┘    │   ║
║  │                    │                                    │   ║
║  │  ┌─────────────────↓──────────────────────────────┐    │   ║
║  │  │  Amazon RDS PostgreSQL (Multi-AZ)               │    │   ║
║  │  │  - sites / pricing_master / transactions        │    │   ║
║  │  │  - users / access_tokens                        │    │   ║
║  │  └────────────────────────────────────────────────┘    │   ║
║  │                                                          │   ║
║  │  ┌────────────────────────────────────────────────┐    │   ║
║  │  │  Amazon S3 + Athena (ログ分析基盤)               │    │   ║
║  │  │  - Cloudflare Logpush → S3 (リアルタイム)        │    │   ║
║  │  │  - 90日後 → S3 Glacier (コスト削減)             │    │   ║
║  │  │  - Athena SQL → ダッシュボードクエリ             │    │   ║
║  │  └────────────────────────────────────────────────┘    │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║  [Stripe]              [Slack]           [Resend]               ║
║  M2M決済処理            異常通知           メール通知              ║
║  Payout管理             (Webhook)         (API)                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 2. コンポーネント詳細

### 2.1 Cloudflare Edge Layer

| コンポーネント | 技術 | 役割 |
|---|---|---|
| Cloudflare Workers | TypeScript | リクエスト処理・AIクローラー判定・402応答 |
| Cloudflare KV | KV Store | アクセストークン保存（TTL: 3600秒） |
| Cloudflare Bot Management | 組み込み機能 | 企業レベルのBot判定スコア |
| Cloudflare Logpush | 組み込み機能 | 全ログをS3へ自動転送 |
| Cloudflare SSL/TLS | 組み込み機能 | エンドツーエンド暗号化 |

**Workers処理フロー（既実装）:**
```typescript
// src/index.ts の処理順序
1. /_adctor/* 内部ルートの振り分け
2. User-Agentでのクローラー検知（crawler-detect.ts）
3. X-Adctor-Token ヘッダーの検証（KVルックアップ）
4. 未払いAI → Stripe Checkout Session作成（stripe.ts）
5. build402Response() で x402フォーマットの応答生成（x402.ts）
6. 人間/有効トークン → proxyToOrigin()
```

### 2.2 AWS バックエンド Layer

**現行スタック（プロトタイプ）:**
- FastAPI + Uvicorn（ローカル動作確認済み）
- インメモリストア（本番前にRDS移行必須）

**本番スタック（推奨）:**

```yaml
# ECS Task Definition
compute:
  cpu: 512
  memory: 1024
  auto_scaling:
    min: 2
    max: 20
    scale_on: CPUUtilization > 70%

container:
  image: adctor-backend:latest
  port: 8000
  env_secrets:
    - STRIPE_SECRET_KEY       (Secrets Manager)
    - STRIPE_WEBHOOK_SECRET   (Secrets Manager)
    - DATABASE_URL            (Secrets Manager)
    - UNSPLASH_ACCESS_KEY     (Secrets Manager)
    - IPINFO_TOKEN            (Secrets Manager)
    - RESEND_API_KEY          (Secrets Manager)
    - SLACK_WEBHOOK_URL       (Secrets Manager)
```

### 2.3 Next.js フロントエンド

**現行実装状況:**

| ページ | 実装状況 | 動作確認 |
|-------|---------|---------|
| `/lp` | 完成（モック） | ✅ |
| `/diagnosis` | 完成（モック） | ✅ |
| `/demo` | 完成（アニメーション） | ✅ |
| `/dashboard` | 完成（モックデータ） | ✅ |
| `/dashboard/sites` | 完成（モック） | ✅ |
| `/dashboard/settings` | 完成（API接続済み） | ✅ |
| `/dashboard/analytics` | 骨格のみ | ⚠️ |
| `/payment/success` | 骨格のみ | ⚠️ |

**本番化に必要な作業:**
1. モックデータ → 実API接続への切り替え
2. WebSocket実装（リアルタイムフィード）
3. AWS Cognito認証の組み込み
4. 本番ドメイン設定（adctor.io）

---

## 3. セキュリティアーキテクチャ

### 3.1 オリジン保護（最重要）

```
AIクローラーによる課金バイパス攻撃:
  攻撃者がAWS IPを特定 → Cloudflareを迂回して直接アクセス → タダ見

対策: Authenticated Origin Pulls

Cloudflare → AWS:
  ├── mTLS証明書をCloudflareが付与
  └── AWS ALBで証明書を検証（証明書なし = 全拒否）

AWSセキュリティグループ:
  ├── Cloudflare IPレンジのみ許可（公式リスト: https://cloudflare.com/ips）
  └── それ以外: DENY ALL
```

### 3.2 Webhook署名検証

```python
# Stripe Webhookの署名検証（実装済み）
import hmac, hashlib

def verify_stripe_webhook(payload: bytes, sig: str, secret: str) -> bool:
    timestamp, signature = sig.split(",")[0].split("=")[1], sig.split(",")[1].split("=")[1]
    signed_payload = f"{timestamp}.{payload.decode()}"
    expected = hmac.new(secret.encode(), signed_payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

### 3.3 認証・認可

| 対象 | 認証方式 | 備考 |
|------|---------|------|
| 管理画面ユーザー | AWS Cognito（MFA必須） | JWTトークン |
| APIキー（サイト識別） | UUID生成・DB保存 | X-API-Keyヘッダー |
| Cloudflare Worker | Wrangler Secrets | 環境変数 |
| Stripe Webhook | HMAC-SHA256署名 | 実装済み |

---

## 4. データフロー詳細

### 4.1 決済フロー（マイクロペイメント）

```
1. AIクローラー → Cloudflare Worker
2. Worker: crawlerを検知 → Stripe Checkout Session作成
   POST https://api.stripe.com/v1/checkout/sessions
   {
     payment_intent_data: {
       application_fee_amount: 160,  // 20% = 160円
       transfer_data: { destination: "acct_xxx" }  // サイトオーナー: 640円
     }
   }
3. Worker → AI: HTTP 402 + {paymentUrl: "https://checkout.stripe.com/..."}
4. AIシステム: Stripe Checkoutにて自動決済
5. Stripe → Worker Webhook (/_adctor/webhook)
6. Worker: KVにtoken保存 (TTL: 3600秒)
7. AI: 次のリクエストに X-Adctor-Token: {tokenId} を付与
8. Worker: KV検証 → オリジンへプロキシ
```

### 4.2 ログ収集フロー

```
Cloudflare Edge
  ↓ Logpush（5分ごとにバッチ）
S3バケット: s3://adctor-logs/{date}/cloudflare-{timestamp}.json.gz
  ↓ S3 Event Notification
Lambda（バッチ処理）
  ↓ パース・集計
RDS（transactions テーブル更新）
  ↓ 
Athena（アドホッククエリ）
  ↓
管理画面ダッシュボード（API経由）
```

---

## 5. 現行プロトタイプと本番の差分

| 項目 | プロトタイプ（現状） | 本番（目標） |
|------|-----------------|-----------|
| データストア | Python dict（インメモリ） | Amazon RDS PostgreSQL |
| デプロイ | ローカル（localhost:8000） | AWS ECS（東京リージョン） |
| Cloudflare Worker | 未デプロイ | Cloudflare Workers（全拠点） |
| 認証 | なし | AWS Cognito |
| ログ | なし | Logpush → S3 → Athena |
| スケーリング | なし | ECS Auto Scaling |
| 監視 | なし | CloudWatch + Slack Alert |
| ドメイン | localhost | adctor.io |

---

## 6. 推奨インフラコスト試算（月額）

| サービス | 無料枠 | 想定コスト |
|---------|-------|----------|
| Cloudflare Workers（有料プラン） | 10万req/日 | $5/月（¥750） |
| Cloudflare Bot Management | - | $200/月（¥30,000）※Enterprise |
| AWS ECS Fargate（t3.small×2） | 750時間 | ¥8,000 |
| Amazon RDS PostgreSQL（db.t3.micro） | 750時間 | ¥3,000 |
| Amazon S3（100GB） | 5GB | ¥2,500 |
| Amazon Athena | 5TB scan | ¥1,500 |
| Stripe手数料 | - | 決済額の3.6% |
| IPinfo API | 5万件/月 | ¥0〜¥3,000 |
| Resend | 100通/日 | ¥0〜¥2,000 |
| **合計** | | **¥45,000〜¥60,000/月** |

> ※ Cloudflare Enterprise（Bot Management含む）は要交渉。
> 代替: Cloudflare Pro($20/月) + Workers有料($5/月) + Workers AI Bot Detection で代替可能。
