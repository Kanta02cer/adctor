# Next Actions

## 直近7日

| 担当 | アクション | 成果物 |
|---|---|---|
| 代表/PM | Standard / Advanced / Enterpriseの提供範囲を確定 | 料金表 |
| 代表/営業 | 代理店3社へデモを見せる | 商談メモ |
| Code X | Alembic migration、seed、レポートCSVを整備 | 開発ブランチ |
| エンジニア | PostgreSQLとPerplexity APIの少量検証 | 実測ログ |
| 法務/税務 | PPC/x402を初期売上に入れない前提でレビュー | 論点メモ |
| Code X | AI crawler/PPC候補ログのDB/APIを検証 | テスト結果 |

## 直近30日

| 目的 | アクション | 判断基準 |
|---|---|---|
| 有償PoC獲得 | 代理店経由で1〜3社の顧客候補を出す | 初期費用50万円以上を払う意思 |
| 商品検証 | 50KW程度をPerplexityで週次測定 | 顧客が月次レポートに価値を感じる |
| 原価把握 | API利用量、再試行、429頻度を計測 | Standard 30万円で粗利80%以上 |
| 開発優先順位 | レポート、請求、権限、API上限を整理 | 営業に必要な順で実装 |
| 投資家説明 | デモ、スライド、P/L、リスク表をまとめる | PPC依存ではない事業説明 |
| PPC検証 | 402候補ログ、価格ルール、dry-runをPoCで確認 | 決済なしで顧客が価値を感じる |

## Code Xに続けて任せる実装

1. Alembic migration導入
2. ローカルPostgreSQL起動手順
3. Hackall demoと既存Next.js HackⅡ画面の統合案
4. CSV/PDFレポート生成
5. job statusテーブル
6. 顧客別API上限
7. Stripe Invoicing Webhook雛形
8. 管理者向け原価・API利用量画面
9. AIクローラー検知イベント画面の本番API化
10. PPC価格ルール・402イベント台帳の本番API化
11. Cloudflare実ログ同期のAPIキー取得後検証
12. PPC本決済の外部専門レビュー

## 人間が決めること

- 最低価格
- 初期費用
- 測定頻度
- 対応AIエンジン
- 法務上の営業表現
- PPC/x402の扱い
- 代理店契約条件
- AI crawlerログの保存期間
- IP/referrer/query stringのマスキング方針
- PPCを営業資料でどう表現するか
