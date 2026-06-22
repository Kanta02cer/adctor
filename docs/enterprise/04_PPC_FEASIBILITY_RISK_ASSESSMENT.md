# PPC実用化ハードル・リスク評価

## 結論

PPC / Pay Per Crawlは、技術的には実装可能です。ただし、Hackallが初期から「AI企業への本決済・分配・精算」まで自前で持つのは難易度が高く、初期売上の主軸にするべきではありません。

当面の現実解は次です。

1. Hackallは `PPC価格ルール`、`402対象判定`、`請求候補ログ`、`監査ログ`、`月次レポート` を提供する
2. 実際の決済・精算はCloudflare Pay Per Crawl、Stripe Connect、または決済専門チームの設計に寄せる
3. 営業では「収益保証」ではなく「AI crawler制御と将来の収益化検証」と表現する

## 技術的ハードル

| 領域 | ハードル | Hackall初期対応 |
|---|---|---|
| crawler identity | User-Agentだけでは偽装される | verified bot、署名、Cloudflare検知IDを保存 |
| 価格判定 | path、crawler、目的別に価格が変わる | `ppc_price_rules` と dry-run APIで検証 |
| HTTP 402 | AI側が402を理解・支払うとは限らない | 402候補ログとして扱う |
| トランザクション | 二重課金、返金、失敗、再試行、照合が必要 | Hackall本体では決済を持たず、候補ログに限定 |
| 精算 | MoR、税務、請求書、分配、手数料が絡む | 法務・税務レビュー後に外部決済へ接続 |
| 監査 | 後から「なぜ課金・遮断したか」を説明する必要 | raw event、rule、decision、actorを保存 |
| 障害対応 | Edge、決済、オリジンのどれが失敗したか切り分けが必要 | event ledgerとaudit logを先に整備 |

## トランザクション管理で必要なもの

本決済に進む場合は、最低でも以下が必要です。

- idempotency key
- payment intent / checkout session / settlement eventの対応表
- crawler request単位の一意キー
- 二重課金防止
- 返金・取消・chargeback対応
- 通貨、税、手数料、分配額の固定記録
- 月次締め、再集計、差額調整
- Webhook署名検証
- 失敗Webhookの再処理
- 監査ログと操作権限

このため、DotStart / Code Xが主に担うべき範囲は、マルチテナント、価格ルール、イベント台帳、画面、API、ログ連携です。決済・精算の最終設計は、決済実装経験のあるエンジニア、法務、税務と進めるべきです。

## コンプライアンス・情報漏洩リスク

| リスク | 内容 | 対策 |
|---|---|---|
| IP/UAログの個人情報性 | IP、User-Agent、referrerが個人関連情報になりうる | IPはhash化、保存期間を定義、DPAに明記 |
| 顧客機密URLの露出 | 管理画面やCSVに未公開URL、トークン付きURLが出る | query string削除、権限分離、CSV権限管理 |
| protected contentの漏洩 | 402 bodyやログに本文・機密要約を含める | 402応答には本文を入れない |
| Cloudflare迂回 | AI crawlerがオリジンへ直接アクセスする | origin pull、mTLS、Cloudflare IP制限 |
| 過剰遮断 | 正規検索botやSNS botを止める | whitelist、dry-run、reviewモード |
| 不正課金 | 偽装crawlerに課金を試みる | verified/signedのみ候補化、未検証は遮断・レビュー |
| 営業表現 | 「AI企業から必ず収益化」と誤認される | 収益化検証・将来オプションとして説明 |

## 管理体制

| 役割 | 必要な責任 |
|---|---|
| PM/代表 | 営業表現、PoC条件、価格、契約範囲を決める |
| エンジニア | DB/API/ログ/監査/権限/障害対応を実装 |
| 決済専門家 | Stripe/Cloudflare決済、Webhook、返金、分配を設計 |
| 法務/税務 | MoR、利用規約、DPA、請求書、消費税、海外取引を確認 |
| セキュリティ担当 | origin保護、秘密情報、権限、監査、インシデント対応を確認 |

## 実装フェーズ

| フェーズ | 実装内容 | 判断 |
|---|---|---|
| Phase A | crawler event保存、PPC rule、dry-run、CSV、月次レポート | すぐ進める |
| Phase B | Cloudflare GraphQL/Logpush実ログ同期 | APIキー取得後に進める |
| Phase C | Workerで402候補を返すPoC | 顧客の検証環境で限定実施 |
| Phase D | Cloudflare Pay Per Crawl / Stripe Connect連携 | 専門レビュー後 |
| Phase E | 本決済、精算、分配、請求書 | 法務・税務・決済体制が整ってから |

## 今回の実装方針

- `crawler_events` にAI crawlerの実アクセスを保存
- `ppc_price_rules` に価格・制御ルールを保存
- `ppc_events` に402候補・拒否・遮断・支払い意思を保存
- `audit_logs` に重要操作を保存
- `POST /api/v1/projects/{project_id}/ppc/dry-run` で本決済なしの判定を返す
- `GET /api/v1/projects/{project_id}/monthly-report` でPoC向けの月次サマリを返す

## 公式情報

- Cloudflare AI Crawl Control: https://developers.cloudflare.com/changelog/post/2026-02-09-reference-documentation/
- Cloudflare AI Crawl Control analytics: https://developers.cloudflare.com/changelog/post/2026-02-09-analytics-enhancements/
- Cloudflare Pay Per Crawl enhancements: https://developers.cloudflare.com/changelog/post/2025-12-10-pay-per-crawl-enhancements/
