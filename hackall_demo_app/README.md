# Hackall Sales Demo MVP

営業で代理店、SEO会社、投資家に見せるための単体HTMLデモです。

## ログイン

```text
Email: agency@hackall.jp
Password: demo2026
```

ログイン画面の「デモログイン」でも入れます。

## 目的

このデモは最終システムではありません。AEO/GEO計測、代理店粗利、請求、Adctor/PPCの将来構想を営業現場で説明し、有償PoCにつなげるための操作可能なモックです。

## 画面

| 画面 | 内容 |
|---|---|
| ログイン | 営業デモ用の疑似ログイン |
| ダッシュボード | 代理店売上、Hackall利用料、代理店粗利、API原価、SOV推移 |
| クライアント管理 | 代理店配下の顧客一覧、追加、Standard枠の説明 |
| AI検索計測 | キーワード設定、疑似計測実行、citation結果追加、ログ更新 |
| AIクローラー検知 | crawler/operator/path/status/bytes/robots違反/リスク分析 |
| PPC設計 | 価格ルール、402判定、請求候補イベント台帳 |
| レポート | 経営者向け、代理店向け、技術者向けの切替表示 |
| CSV出力 | 測定結果CSVダウンロード |
| 請求・プラン | Standard / Advanced / Enterprise、請求書発行、入金確認の疑似操作 |
| 導入設定 | 代理店申込から初回測定までのチェックリスト |

## 追加した詳細要件

| 資料 | 内容 |
|---|---|
| `docs/AI_CRAWLER_DETECTION_REQUIREMENTS.md` | AIクローラー検知で取得すべきデータ、分析、UI要件 |
| `docs/PPC_REQUIREMENTS.md` | PPC価格ルール、402判定、event ledger要件 |
| `docs/PPC_FEASIBILITY_RISK_ASSESSMENT.md` | PPC本決済化のハードル、コンプライアンス、漏洩リスク |

## 営業ストーリー

```text
代理店が月額30万円でHackallを導入
↓
エンド顧客3社に月10万円でAEO/GEOコンサルを販売
↓
3社でHackall費用を回収
↓
4社目から代理店の粗利
↓
10社を超えたらAdvanced 60万円へアップセル
```

## 本番化で必要な実装

| 領域 | 本番で必要な実装 |
|---|---|
| 認証 | Auth0 / Firebase Auth / Supabase Auth / 自社JWT |
| DB | PostgreSQL |
| API | FastAPI |
| AI検索測定 | Perplexity / Gemini / OpenAI API |
| Queue | GCP Cloud Tasks + Cloud Run Worker |
| 請求 | Stripe Invoicing / Subscriptions / Webhook |
| 権限制御 | Standard / Advanced / Enterpriseの実制限 |
| レポート | PDF生成、CSV、ホワイトラベル |
| セキュリティ | Secret Manager、Stripe署名検証、IAM、CORS |

## 使い方

`index.html` をブラウザで開くだけで動作します。外部API、ビルド、サーバーは不要です。
