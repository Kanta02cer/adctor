# 機能仕様書

**プロジェクト名:** Adctor PPCW システム  
**バージョン:** 1.0  
**作成日:** 2026年6月9日

---

## 1. 管理画面 画面仕様

### 1.1 画面一覧

| 画面ID | 画面名 | URL | 認証要否 |
|-------|-------|-----|---------|
| S-01 | ランディングページ | `/lp` | 不要 |
| S-02 | AI診断ツール | `/diagnosis` | 不要 |
| S-03 | デモページ | `/demo` | 不要 |
| S-04 | ダッシュボード（総合） | `/dashboard` | 要 |
| S-05 | サイト管理 | `/dashboard/sites` | 要 |
| S-06 | 分析・レポート | `/dashboard/analytics` | 要 |
| S-07 | 設定・オンボーディング | `/dashboard/settings` | 要 |
| S-08 | 支払い成功 | `/payment/success` | 不要（トークン検証） |
| S-09 | 支払いデモ | `/payment/demo` | 不要 |
| S-10 | Connect登録完了 | `/connect/return` | 不要 |

---

### S-01: ランディングページ（`/lp`）

**目的:** Adctorの価値を伝え、無料診断・オンボーディングへ誘導

**セクション構成:**
1. ヒーロー: キャッチコピー「AIに盗まれるか、AIに売るか。」+ CTA
2. 課題提示: AIクロールの被害規模（統計データ）
3. ソリューション: PPCW仕組み図
4. Package A（GEO最適化）/ Package B（課金設置）の料金カード
5. ロードマップ（3フェーズ）
6. FAQ
7. 無料診断 CTA

**必要な外部API連携:**
- Unsplash API: ヒーロー画像・セクション背景画像の動的取得
  - クエリ: `technology`, `data`, `cybersecurity`, `AI`
  - キャッシュ: 24時間

---

### S-02: AI診断ツール（`/diagnosis`）

**目的:** URLを入力するだけでAIクロール被害を可視化し、導入動機を生成

**入力:**
- URL入力フィールド（例: `https://example.co.jp`）

**処理フロー（フロントエンド疑似スキャン + バックエンド実判定）:**
```
Step 1: ドメインのWhois・robots.txt取得
Step 2: IPinfo APIでASN・ホスティング確認
Step 3: 既知AIクローラーのアクセスパターン推定
Step 4: 月間AIアクセス推計（業界平均データから）
Step 5: 収益ポテンシャル計算
```

**出力:**
- 推定月間AIアクセス数（クローラー別内訳）
- 現在の機会損失額（円）
- 推奨アクション（Package A or B）
- 1年間の予測収益グラフ

**必要なAPIキー:**
- `IPINFO_TOKEN`: IP・ASN判定
- `UNSPLASH_ACCESS_KEY`: 結果画面の背景画像

---

### S-04: ダッシュボード（`/dashboard`）

**目的:** サイトオーナーがリアルタイムで収益・アクセス状況を把握

**データソース:**
- リアルタイム: WebSocket（バックエンド → フロントエンド push）
- 履歴データ: REST API（`/api/v1/stats/{api_key}`）
- 分析データ: AWS Athena クエリ結果（S3ベース）

**表示要素:**

```
┌── KPIカード（4枚）──────────────────────────────────────┐
│  今月収益       AIアクセス数    決済件数     ブロック数    │
│  ¥142,500      3,421回        178件       3,243件       │
└─────────────────────────────────────────────────────────┘
┌── 収益グラフ（折れ線）──────────────────────────────────┐
│  日別収益推移（過去30日）+ 来月予測                        │
└─────────────────────────────────────────────────────────┘
┌── クローラー円グラフ ─┐ ┌── 人気コンテンツTOP5 ─────────┐
│  GPTBot: 45%        │ │  URL              収益         │
│  ClaudeBot: 30%     │ │  /blog/ai-trends  ¥38,400     │
│  Perplexity: 15%    │ │  /tech/llm        ¥24,800     │
│  その他: 10%         │ │  ...                          │
└─────────────────────┘ └──────────────────────────────┘
┌── リアルタイムフィード（WebSocket）────────────────────────┐
│  ● [14:23:01] GPTBot → /blog/ai-future → ¥800 決済完了  │
│  ● [14:22:45] ClaudeBot → /premium → ブロック           │
└─────────────────────────────────────────────────────────┘
```

---

### S-05: サイト管理（`/dashboard/sites`）

**目的:** 登録サイトの管理・JSタグの取得・Stripe Connect状況確認

**機能:**

1. **サイト一覧表示**
   - ドメイン / APIキー / Stripe状況 / 今月収益 / 最終アクセス
   
2. **新規サイト登録**
   ```
   入力: メールアドレス, ドメイン名
   処理: Stripe Express Account作成 → Account Link URL発行
   出力: APIキー + Stripeオンボーディングリンク
   ```

3. **JSタグ取得（コピー用）**
   ```html
   <!-- Adctor AI Gateway Tag -->
   <script>
   (function(w,d,a){
     w._adctor={apiKey:"YOUR_API_KEY",api:"https://api.adctor.io"};
     var s=d.createElement("script");
     s.async=true;
     s.src=w._adctor.api+"/v1/tag.js";
     d.head.appendChild(s);
   })(window,document,"YOUR_API_KEY");
   </script>
   ```

4. **価格設定（ディレクトリ別）**

| URL パターン | アクション | 価格（円） |
|---|---|---|
| /premium/* | 課金 | ¥2,000 |
| /blog/* | 課金 | ¥500 |
| /about | 無料開放（GEO） | - |
| /* | 課金 | ¥800 |

---

## 2. API仕様

### 2.1 バックエンドAPI一覧（FastAPI）

```
POST /api/v1/connect/onboard        サイトオーナー登録・Stripe Connect開始
GET  /api/v1/connect/status/{key}   Stripe Connect状況確認
POST /api/v1/check-access           AIクローラー判定（Cloudflare Workerから呼び出し）
POST /api/v1/webhook/stripe         Stripe Webhookイベント受信
GET  /api/v1/stats/{api_key}        統計データ取得
POST /api/v1/publisher/price        サイト価格設定更新
GET  /api/v1/pricing/{domain}       ドメインの価格ルール取得（Cloudflare Workerから）
WS   /api/v1/ws/{api_key}           リアルタイムイベントストリーム
```

### 2.2 Cloudflare Worker エンドポイント

```
GET  /*                             メインゲートウェイ（全リクエストを処理）
POST /_adctor/webhook               Stripe Webhook受信
GET  /_adctor/health                ヘルスチェック
```

### 2.3 主要APIレスポンス定義

**POST /api/v1/check-access** （AIクローラー判定）

リクエスト:
```
Header: User-Agent, X-API-Key, X-Access-Token（任意）
Body: 空
```

レスポンス（人間 or 有効トークン）:
```json
{"allow": true, "reason": "human_traffic"}
```

レスポンス（AIクローラー検知）:
```json
HTTP 402
{
  "allow": false,
  "reason": "ai_crawler_detected",
  "crawler": "GPTBot",
  "payment_required": {
    "amount": 800,
    "currency": "jpy",
    "payment_url": "https://checkout.stripe.com/...",
    "token_id": "uuid-v4-token",
    "message": "このコンテンツへのアクセスには料金が必要です。"
  }
}
```

---

## 3. 外部API連携仕様

### 3.1 Unsplash API

**用途:** LP・管理画面の画像素材の動的取得

```
エンドポイント: https://api.unsplash.com/photos/random
認証: Authorization: Client-ID {UNSPLASH_ACCESS_KEY}
```

**実装箇所:**
- `/lp` ヒーロー背景: `query=artificial intelligence,data`
- `/dashboard` ヘッダー: `query=technology`
- `/diagnosis` 結果画面: `query=security,protection`

**実装コード例（Next.js Server Component）:**
```typescript
async function fetchUnsplashImage(query: string): Promise<string> {
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape`,
    {
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
      next: { revalidate: 86400 }, // 24時間キャッシュ
    }
  );
  const data = await res.json();
  return data.urls.regular;
}
```

### 3.2 IPinfo API

**用途:** AIクローラーのIP・ASN・組織名の判定

```
エンドポイント: https://ipinfo.io/{ip}/json
認証: ?token={IPINFO_TOKEN}
無料枠: 50,000件/月
```

**判定ロジック:**
```python
AI_ORGS = [
    "OpenAI", "Anthropic", "Google", "Meta",
    "Perplexity AI", "Common Crawl", "Apple"
]
AI_ASNS = ["AS15169", "AS16509", "AS8075", "AS54113"]  # Google, AWS, Microsoft, Fastly

async def is_ai_by_ip(ip: str) -> bool:
    data = await ipinfo_client.getDetails(ip)
    org = data.org or ""
    return (
        any(ai in org for ai in AI_ORGS) or
        data.asn in AI_ASNS
    )
```

### 3.3 Resend API（メール通知）

**用途:** 決済完了通知・月次レポート・大型アクセスアラート

**送信タイミング:**
| トリガー | メール内容 | 受信者 |
|---------|-----------|-------|
| 決済完了（¥10,000以上） | 大型決済通知 | サイトオーナー |
| 月末 | 月次収益レポート | サイトオーナー |
| 異常アクセス（10分で100件以上） | セキュリティアラート | サイトオーナー + Adctor管理者 |
| Stripe Payout完了 | 振込完了通知 | サイトオーナー |

**実装例:**
```python
from resend import Resend

resend = Resend(api_key=os.getenv("RESEND_API_KEY"))

def send_payment_notification(site: dict, transaction: dict):
    resend.emails.send({
        "from": "Adctor <notify@adctor.io>",
        "to": site["email"],
        "subject": f"【Adctor】AIアクセス決済完了 ¥{transaction['amount_jpy']:,}",
        "html": render_email_template("payment_complete", {
            "site_domain": site["domain"],
            "crawler": transaction["crawler_ua"],
            "amount": transaction["amount_jpy"],
            "payout": transaction["payout_jpy"],
        })
    })
```

### 3.4 Slack Webhook

**用途:** リアルタイム異常検知・大型決済の即時通知

**通知種別:**
- 🤖 新規AIクローラー検知（未知のUA）
- 💰 高額決済（¥5,000以上/1回）
- 🚨 DDoS疑い（10秒で50件以上のAIアクセス）
- ✅ 新規サイト登録

```python
import httpx

async def notify_slack(message: str, emoji: str = "🤖"):
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url:
        return
    await httpx.AsyncClient().post(webhook_url, json={
        "text": f"{emoji} *Adctor Alert*\n{message}"
    })
```

---

## 4. 重要な制約事項

### 4.1 Stripe最小課金額
- JPYの最小チャージ: ¥50
- ¥50未満の設定は自動的に¥50に切り上げ
- マイクロペイメント（¥1〜¥49）は**バッチ集計決済**を推奨

### 4.2 Cloudflare Workers制限
- CPU時間: 50ms/リクエスト（無料）/ 30秒（有料）
- メモリ: 128MB
- KV読み書き: 1,000回/日（無料）/ 無制限（有料）
- **AIクローラー判定ロジックは50ms以内に完了させること**

### 4.3 AIクローラー偽装への対応方針
- **完全な偽装検知は不可能** — UA偽装+IPv6ローテーションの組み合わせには限界あり
- **現実的な対策:** 多層防御（UA + ASN + 挙動）で偽装コストを高める
- **ビジネス判断:** 偽装してでも取りに来るコンテンツ = 価値の証明

### 4.4 法的留意点
- AIクローラーへの課金は「技術的アクセス制限」として合法（日本・米国）
- 過度な遮断は「ビジネス妨害」になる可能性（要法務確認）
- GDPR/個人情報保護法: IPアドレスログの保存は要同意または匿名化
