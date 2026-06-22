# Hackall / Adctor 企業導入ロードマップ

この文書は、営業用デモMVPを実際に企業へ導入できるプロダクトへ移行するための手順です。

## 0. 前提

初期売上の本線は、PPC/x402によるAI企業からの自動課金ではなく、代理店向けのAEO/GEO診断SaaS、月次レポート、運用支援です。

```text
代理店が月額30万円でHackall Standardを導入
↓
エンド顧客3社に月10万円でAEO/GEOコンサルを販売
↓
3社でHackall費用を回収
↓
4社目から代理店粗利
↓
10社超でAdvancedへアップセル
```

PPCは、初期段階では本決済システムではなく、AI crawler制御、402候補判定、価格検証、請求候補ログとして扱います。決済・精算・分配・返金・税務を伴う本番化は、決済専門家、法務、税務レビュー後に進めます。

## 1. 企業導入までのフェーズ

| フェーズ | 目的 | 完了条件 | 主担当 |
|---|---|---|---|
| Phase 1: Sales Demo | 代理店・投資家に価値を伝える | ログイン付きデモ、営業資料、API契約がある | PM + Code X |
| Phase 2: Technical MVP | 実データで測定できる | PostgreSQL、Perplexity、キュー、SOV集計が動く | Code X + エンジニア |
| Phase 3: Paid PoC | 1〜3社で有償検証 | 初期費用を受領し、週次レポートを出せる | 代表 + PM |
| Phase 4: Commercial Beta | 代理店が継続販売できる | 認証、請求、上限、監視、失敗通知がある | エンジニア |
| Phase 5: Enterprise Ready | 大手企業に出せる | IAM、監査ログ、DPA、SLA、障害対応がある | エンジニア + 法務 |

## 2. 開発で必須の手順

### 2.1 DBとデータ管理

- Alembic migrationでDB変更を管理する
- `citations_raw JSONB` を保存し、後から再集計できるようにする
- 測定ジョブを `measurement_jobs` に保存する
- ジョブには `queued / running / succeeded / failed / rate_limited` を持たせる
- 同じ日・同じキーワード・同じエンジンの重複実行を防ぐ
- seedデータと本番データを分離する

### 2.2 APIとキュー

- FastAPIを本番APIとして整理する
- Cloud TasksはAIエンジン別に分割する
- 429発生時は該当エンジンのみ停止または減速する
- Cloud Run Workerは認証付きエンドポイントにする
- 失敗ジョブ、再試行、dead-letterの方針を決める

### 2.3 AI検索測定

- MVPはPerplexityを主軸にする
- Gemini/OpenAIは取得安定性と原価を確認してから正式対応する
- 空のcitations、回答なし、429、5xxを別々に記録する
- 顧客に見せる指標はSOV、引用URL、引用順位、未露出KWに絞る

### 2.4 認証と権限

- 代理店、エンド顧客、管理者のロールを分ける
- Standard / Advanced / Enterpriseの上限をDBで管理する
- 顧客データは代理店単位で分離する
- 管理者操作は監査ログに残す

### 2.5 請求

- 最初のPoCは請求書/銀行振込でよい
- 10社を超えたらStripe InvoicingまたはSubscriptionsを接続する
- `invoice.paid` と `payment_failed` をDBに反映する
- PPC/x402の分配は法務・税務レビュー後まで本番化しない

### 2.6 監視と運用

- APIエラー、429、ジョブ失敗、API原価をSlackまたはメールへ通知する
- 顧客別API利用量と月間上限を表示する
- DBバックアップとリストア手順を作る
- 障害時に手動再実行できる管理画面を作る

### 2.7 AIクローラー検知とPPC候補ログ

- `crawler_events` にAI crawlerのアクセス実態を保存する
- `ppc_price_rules` にpath/crawler/operator別の価格・制御ルールを保存する
- `ppc_events` に402候補、拒否、遮断、支払い意思、署名状態を保存する
- IPは原則hash化し、query stringやtokenをログに残さない
- 未検証crawlerは課金せず、遮断または手動レビューに回す
- 本決済ではなくdry-runと候補ログから開始する

## 3. PM・代表が決めること

| 項目 | 推奨初期案 |
|---|---|
| 最低価格 | 月額30万円 |
| 初期費用 | 50万円以上 |
| Standard | 10社 / 50KW / 社 / 週1回 / Perplexity中心 |
| Advanced | 30社 / 100KW / 社 / 週1〜2回 / 複数エンジン |
| Enterprise | 個別見積もり |
| 最低契約期間 | 3か月 |
| 初月 | 前払い |
| PPC/x402 | 将来オプション |

## 4. 企業に見せる前のチェックリスト

- [ ] 営業デモがローカルで開ける
- [ ] PostgreSQLでmigrationが通る
- [ ] seedデータでHackII画面が表示できる
- [ ] Perplexity APIの少量測定が成功する
- [ ] 429時にPerplexityキューだけ止まる
- [ ] CSVレポートが出せる
- [ ] APIキーがコードに直書きされていない
- [ ] 代理店と顧客の権限分離方針がある
- [ ] 請求書・契約書・禁止営業表現が整理されている
- [ ] 障害時の連絡先と再実行手順がある

## 5. 次にCode Xで進める実装

1. Alembic migrationの整備
2. `measurement_jobs` のAPI表示
3. ローカルPostgreSQL起動手順
4. CSV/PDFレポート生成
5. 顧客別API上限
6. Stripe Invoicing Webhook雛形
7. 管理者向けAPI利用量・原価画面
8. GCP Cloud Tasks本番設定のTerraformまたは手順書
9. AIクローラー検知イベントの保存・分析
10. PPC価格ルールと402イベント台帳
11. PPC dry-run APIと本決済化リスク評価
