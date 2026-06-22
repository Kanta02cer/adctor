# Engineer Handoff

## 本番化の推奨構成

```text
Next.js Dashboard
  ↓
FastAPI Backend
  ↓
PostgreSQL / Cloud SQL
  ↓
GCP Cloud Tasks
  ↓
Cloud Run Worker
  ↓
Perplexity / Gemini / OpenAI
```

## 既存実装との接続方針

現在のバックエンドでは以下が進行済みです。

- SQLAlchemy非同期モデル
- `citations_raw JSONB`
- Perplexity / Gemini / OpenAI エンジン別キュー
- 429時の対象エンジンのみ一時停止
- Perplexity citations parser
- FastAPIのプロジェクト、キーワード、競合、SOV、手動計測API
- WebSocket通知

このデモの画面構造を本番に寄せる場合、以下のAPIへ置き換えます。

| デモ操作 | 本番API |
|---|---|
| プロジェクト一覧 | `GET /api/v1/projects` |
| キーワード登録 | `POST /api/v1/projects/{project_id}/keywords` |
| 競合追加 | `POST /api/v1/projects/{project_id}/competitors` |
| 競合削除 | `DELETE /api/v1/projects/{project_id}/competitors/{id}` |
| 手動計測 | `POST /api/v1/projects/{project_id}/crawl` |
| 結果通知 | `WS /api/v1/ws/hackii/{project_id}` |

## 実装上の注意

- APIキーは必ず環境変数かSecret Managerで管理する
- `citations_raw` は後から再集計できるよう削除しない
- 429は該当エンジンのキューだけ停止する
- 測定ジョブは冪等にする
- Standard / Advanced / Enterpriseの上限はDBで管理する
- 顧客に見せるレポートと内部ログは分離する
- PPC/x402は法務・税務レビュー前に本番決済化しない

## 次の実装候補

1. Alembic migration導入
2. ローカルPostgreSQLでseed実行
3. Perplexity API少量検証
4. job statusテーブル追加
5. Stripe InvoicingのWebhook雛形
6. CSV/PDFレポート生成
7. プラン別上限ロジック
8. 管理者向けAPI利用量・原価表示
