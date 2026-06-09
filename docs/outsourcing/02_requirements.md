# 要件定義書

**プロジェクト名:** Adctor PPCW システム  
**バージョン:** 1.0  
**作成日:** 2026年6月9日  
**ステータス:** レビュー中

---

## 1. 業務フロー定義

### 1.1 メインフロー：AIクローラーのアクセスから決済まで

```
┌─────────────────────────────────────────────────────────────────┐
│                     AIクローラーのアクセスフロー                     │
└─────────────────────────────────────────────────────────────────┘

Step 1【設定（人間）】
  サイト管理者 → 管理画面でディレクトリ別価格を設定
  例: /premium/* → ¥50/回, /blog/* → ¥5/回, /about → 無料開放

Step 2【同期（システム）】
  管理画面DB → Cloudflare Workers KV へ価格ルールを自動同期

Step 3【アクセス（AI）】
  AIクローラー → CloudflareにHTTP GETリクエスト
  ヘッダー例: User-Agent: GPTBot/1.0
              crawler-max-price: 0.01 USD

Step 4【判定（Cloudflare Edge）】
  ┌── 人間（ブラウザ）と判定 → オリジンサーバーへプロキシ（通常表示）
  └── AIクローラーと判定
        ├── ブロックリスト → 403 Forbidden
        ├── GEO許可リスト → 通常コンテンツ + Schema.org付与で配信
        └── 課金対象 → HTTP 402 Payment Required を返却

Step 5【決済（Stripe M2M）】
  AIクローラーが受け取る402レスポンス:
  {
    "x402": {
      "scheme": "stripe-checkout",
      "amount": 50,
      "currency": "jpy",
      "paymentUrl": "https://checkout.stripe.com/...",
      "tokenId": "uuid-v4",
      "validFor": 3600
    }
  }
  → AIシステムが自動でStripeに決済リクエスト
  → Stripe Webhook → Cloudflare KVにアクセストークン保存

Step 6【コンテンツ配信（AWS）】
  AIが次のリクエスト時に X-Adctor-Token: {tokenId} を付与
  → Cloudflare KVで検証 → 有効なら AWSオリジンへプロキシ
  → コンテンツをAIに返却（1時間有効）

Step 7【ログ集計（システム）】
  Cloudflare Logpush → S3バケットへJSONログ自動転送（リアルタイム）
  S3 → Athena → 管理画面ダッシュボードで可視化
```

### 1.2 サブフロー：偽装検知フロー

```
AIクローラーが人間を偽装してアクセスしようとするケース:

User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120...
（人間のブラウザを偽装）

Adctorの多層検知:
  Layer 1: User-Agent解析（既知のAI UAパターン）
  Layer 2: IP/ASN判定（IPinfo APIでAI企業のASNを判定）
             → AS15169 (Google), AS16509 (Amazon), AS14618 (Amazon)
             → AS8075 (Microsoft/OpenAI), AS54113 (Fastly/Perplexity)
  Layer 3: 挙動解析（JavaScript実行なし / Cookieなし / セッション異常）
  Layer 4: アクセスパターン（同一IPからの連続・規則的アクセス）
  
→ 3Layer以上でAI判定 → 課金フローへ
```

---

## 2. 機能要件一覧

### F-01: オリジン保護機能

**目的:** AWSオリジンサーバーへの直接アクセスを防ぎ、課金壁のバイパスを防止

| 項目 | 内容 |
|------|------|
| 要件 | AWSセキュリティグループで「Cloudflare IPレンジ以外」を全て拒否 |
| 実装方法 | Cloudflare Authenticated Origin Pulls (mTLS証明書) |
| テスト | Cloudflare外からAWS IPへ直接cURL → 403確認 |
| 優先度 | 最高（P0） |

### F-02: AIクローラー検知・分類エンジン

**目的:** AIクローラーを正確に検知し、Allow/Charge/Blockに分類

| 項目 | 内容 |
|------|------|
| 検知方法① | User-Agent文字列マッチング（18種以上のAI UAパターン） |
| 検知方法② | IPinfo API によるASN・組織名判定 |
| 検知方法③ | 挙動フィンガープリント（JSなし・Cookie無視・連続アクセス） |
| 分類アクション | Allow（無料GEO）/ Charge（課金）/ Block（完全遮断）|
| 設定管理 | 管理画面からリアルタイムでルール変更可能 |
| 優先度 | 最高（P0） |

**検知対象AIクローラー（既実装分）:**

```
課金対象（Charge）:
GPTBot, ChatGPT-User, OAI-SearchBot（OpenAI）
ClaudeBot, Claude-Web（Anthropic）
PerplexityBot（Perplexity AI）
GoogleExtendedBot, Gemini（Google）
CCBot（Common Crawl / AI学習）
YouBot（You.com）
meta-externalagent（Meta AI）
Applebot-Extended（Apple AI）

GEO許可（Allow・無料）:
Googlebot, Bingbot（SEO indexing）
DuckDuckBot, Baidu, Yandex（検索エンジン）

完全ブロック（Block）:
管理画面で個別設定
```

### F-03: ダイナミックプライシング

**目的:** コンテンツ価値に応じた柔軟な価格設定

| 項目 | 内容 |
|------|------|
| 価格単位 | URLディレクトリパス単位（/premium/*, /blog/*, /* 等） |
| 価格範囲 | ¥1〜¥10,000 / 1アクセス |
| 通貨 | JPY（内部計算はUSD、日本円換算で表示） |
| 優先順位 | 最長マッチのパスルールが適用（/premium/ai/* > /premium/* > /*） |
| リアルタイム反映 | 管理画面の変更が60秒以内にEdgeへ同期 |
| 優先度 | 高（P1） |

**価格マスタテーブル設計（DB）:**

```sql
CREATE TABLE pricing_master (
  id            SERIAL PRIMARY KEY,
  site_id       UUID NOT NULL,
  target_path   VARCHAR(500) NOT NULL,  -- 例: /premium/*, /blog/*
  action        VARCHAR(10) NOT NULL,   -- 'charge', 'allow', 'block'
  price_jpy     INTEGER,                -- null=allow/blockの場合
  price_usd     DECIMAL(10,4),          -- 同上
  crawler_type  VARCHAR(50),            -- null=全AI, 'GPTBot'=特定のみ
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### F-04: Stripe Connect 決済インフラ

**目的:** M2M決済の受け取りとサイトオーナーへのPayout

| 項目 | 内容 |
|------|------|
| 決済方式 | Stripe Checkout Session（カード・M2M） |
| 分配比率 | サイトオーナー 80% / Adctor 20% |
| Payout | Stripe Expressアカウント経由で自動振込 |
| 最小課金額 | ¥50（Stripe最小チャージ額を考慮） |
| マイクロペイメント対応 | 1アクセスを即決済ではなく集計後バッチ決済も検討 |
| 優先度 | 最高（P0） |

### F-05: Cloudflare Logpush + AWS ログ分析基盤

**目的:** 全アクセスログの長期保存と収益分析

| 項目 | 内容 |
|------|------|
| ログ転送 | Cloudflare Logpush → S3（リアルタイム、5分単位） |
| ログ形式 | JSON Lines（Cloudflare標準形式） |
| ストレージ | S3 Standard → 90日後 S3 Glacier（コスト最適化） |
| 分析 | AWS Athena（サーバーレスSQL） |
| ログ項目 | タイムスタンプ, IP, ASN, UA, パス, HTTPステータス, 決済金額, トークンID |
| 優先度 | 高（P1） |

### F-06: 収益ダッシュボード

**目的:** サイトオーナーがリアルタイムで収益を把握

**ダッシュボード画面構成:**

```
┌────────────────────────────────────────────────────────────┐
│ 総合ダッシュボード                                            │
├──────────┬──────────┬──────────┬──────────────────────────┤
│ 今月の収益  │ AIアクセス │ 決済件数  │ ブロック件数               │
│ ¥142,500  │  3,421件  │  178件   │  3,243件                │
├──────────┴──────────┴──────────┴──────────────────────────┤
│ 収益グラフ（日別・週別・月別）                                   │
├──────────────────────────┬─────────────────────────────────┤
│ AIクローラー別シェア（円グラフ）  │ 人気コンテンツランキング（収益順）   │
│ GPTBot: 45%               │ 1. /blog/ai-trends  ¥38,400  │
│ ClaudeBot: 30%            │ 2. /tech/llm-compare ¥24,800  │
│ PerplexityBot: 15%        │ 3. /research/...    ¥21,600  │
│ その他: 10%               │                               │
├──────────────────────────┴─────────────────────────────────┤
│ リアルタイムフィード（WebSocket）                               │
│ [14:23:01] GPTBot → /blog/ai-future → ¥800 決済完了         │
│ [14:22:45] ClaudeBot → /premium/data → ブロック             │
└────────────────────────────────────────────────────────────┘
```

### F-07: GEO（生成AI最適化）機能

**目的:** AIに無料開放するページを最大限活用し、Adctorの認知とAI課金への誘導を促進

| 項目 | 内容 |
|------|------|
| Schema.org付与 | Article, FAQPage, HowTo等の構造化データを自動生成 |
| llms.txt 生成 | サイト構造をAIが理解しやすい形式で公開 |
| AI向けメタタグ | `<meta name="ai-access" content="allowed">` |
| 実装方法 | Cloudflare Workerが配信時にHTMLヘッダーを書き換え |
| 優先度 | 中（P2） |

---

## 3. 非機能要件

### 3.1 パフォーマンス

| 要件 | 目標値 |
|------|--------|
| Cloudflare Edge レイテンシ | AI判定追加分 < 10ms |
| 402レスポンス応答 | < 100ms（世界平均） |
| 管理画面の初期表示 | < 2秒（LCP） |
| 価格設定変更の反映 | Cloudflare Edge全体で < 60秒 |

### 3.2 可用性

| 要件 | 目標値 |
|------|--------|
| Cloudflare Edge | 99.99%（SLAに準拠） |
| AWSバックエンド | 99.9%（マルチAZ構成） |
| 管理画面 | 99.5% |

### 3.3 スケーラビリティ

- AIクローラーは突発的にバースト（1秒に数百リクエスト）する
- Cloudflare Edgeは自動スケール（追加設定不要）
- AWS EC2/ECSはAuto Scalingを設定必須
- Stripe APIレート制限（25req/秒）を考慮したキューイング設計

### 3.4 セキュリティ

| 要件 | 実装方法 |
|------|---------|
| オリジン保護 | Authenticated Origin Pulls（mTLS） |
| Webhook改ざん防止 | Stripe署名検証（HMAC-SHA256） |
| 管理画面認証 | AWS Cognito（MFA必須） |
| APIキー管理 | AWS Secrets Manager |
| 通信 | 全HTTPS（TLS 1.3） |
| SQLインジェクション対策 | ORM使用（parameterized query） |

### 3.5 コスト上限（月額）

| サービス | 想定コスト |
|---------|----------|
| Cloudflare Workers | ~¥0（無料枠内）〜¥3,000 |
| AWS EC2/RDS | ~¥15,000〜¥50,000 |
| AWS S3/Athena | ~¥1,000〜¥5,000 |
| Stripe（手数料） | 決済金額の3.6% |
| IPinfo API | ~¥0（無料枠50,000件/月）〜¥3,000 |
| 合計 | ~¥20,000〜¥60,000/月 |

---

## 4. データ定義

### 4.1 主要テーブル一覧

```
sites             - 登録サイト（ドメイン・APIキー・Stripeアカウント）
pricing_master    - ディレクトリ別価格設定
access_tokens     - 有効なアクセストークン（Cloudflare KVと同期）
transactions      - 決済トランザクション履歴
crawler_events    - AIアクセスイベントログ（S3から集計）
users             - 管理画面ユーザー
```

### 4.2 sitesテーブル定義

```sql
CREATE TABLE sites (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL,
  domain                VARCHAR(255) NOT NULL UNIQUE,
  api_key               VARCHAR(8) NOT NULL UNIQUE,
  stripe_account_id     VARCHAR(100),        -- Stripe Connect Account ID
  stripe_onboarded      BOOLEAN DEFAULT FALSE,
  default_price_jpy     INTEGER DEFAULT 800,
  status                VARCHAR(20) DEFAULT 'active',
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);
```

### 4.3 transactionsテーブル定義

```sql
CREATE TABLE transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id           UUID NOT NULL,
  stripe_session_id VARCHAR(200) UNIQUE,
  token_id          UUID NOT NULL,
  crawler_ua        VARCHAR(500),
  crawler_ip        VARCHAR(45),
  crawler_asn       VARCHAR(50),
  path_accessed     VARCHAR(2000),
  amount_jpy        INTEGER NOT NULL,
  platform_fee_jpy  INTEGER NOT NULL,
  payout_jpy        INTEGER NOT NULL,
  status            VARCHAR(20) DEFAULT 'pending', -- pending/completed/refunded
  created_at        TIMESTAMP DEFAULT NOW(),
  completed_at      TIMESTAMP
);
```
