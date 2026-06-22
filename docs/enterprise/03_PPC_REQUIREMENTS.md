# PPC / Pay Per Crawl 要件

## 目的

AI crawlerからの収益化可能性を検証する。ただし初期売上の本線には入れず、請求候補・制御・価格検証として扱う。

## 取得すべきデータ

| 区分 | データ | 用途 |
|---|---|---|
| identity | crawler, operator, verified, signature_status | 支払い対象として扱えるか |
| pricing | path_pattern, exact_price, max_price, currency | 価格判定 |
| decision | allow, block, 402, bypass, manual_review | レスポンス制御 |
| payment intent | crawler_exact_price, crawler_max_price, signed_headers | 支払い意思の証跡 |
| event | timestamp, path, status, reason, response_code | 監査ログ |
| revenue | candidate_gmv, accepted_gmv, rejected_gmv, settled_amount | レポート |
| exception | unverified, price_too_low, policy_exempt, search_allowed | 未回収理由 |

## 機能要件

1. path pattern別に価格を設定できる
2. 検索目的crawlerは無料許可、学習目的crawlerは有料化などの分岐ができる
3. 未検証crawlerは課金ではなく遮断または手動レビューに送る
4. crawlerのmax priceが価格ルールを下回る場合は拒否できる
5. 支払い意思ヘッダーと署名確認結果を保存できる
6. 402を返したイベント、支払い候補、拒否理由を台帳化する
7. GMV、accepted、rejected、unrealizedを分けて表示する
8. 顧客向けには「収益保証」ではなく「収益化検証」と表現する

## UI/UX要件

| 対象 | 見せるもの | 理由 |
|---|---|---|
| 経営者 | 保守的な想定回収、未回収理由、将来オプション | 過度な期待を避ける |
| 代理店 | 有料化候補URL、価格、提案文 | 顧客に説明する |
| 技術者 | signed headers、identity、price rule、response code | 再現性と監査性 |

## デモ反映

`hackall_demo_app` に `PPC設計` 画面を追加した。

- PPC候補request
- 想定月間回収
- 支払い意思候補
- 拒否/遮断件数
- 価格ルール
- 402 decision simulator
- PPC event ledger
- 営業時の切り分け

## 次の実装

1. `ppc_price_rules` テーブル
2. `ppc_events` テーブル
3. Worker側のdecision engine
4. 402 responseテンプレート
5. dry-run API
6. 管理画面での価格ルール編集
7. 法務・税務レビュー後の決済連携

## 実装済みの本番API化方針

- `ppc_price_rules`: path、operator、crawler、category別の価格・制御ルール
- `ppc_events`: 402候補、拒否、遮断、支払い意思、署名状態、charge status
- `POST /api/v1/projects/{project_id}/ppc/dry-run`: 本決済なしでallow/block/402候補/reviewを判定
- `GET /api/v1/projects/{project_id}/ppc/events/export.csv`: PoC向けCSV
- `GET /api/v1/projects/{project_id}/monthly-report`: 月次レポートのPPC候補サマリ

## 営業・PoCでの制限

PPCは初期売上の主軸にしない。PoCでは、決済済み売上ではなく次のように表現する。

- 請求候補
- 支払い意思候補
- 価格不足による拒否
- 未検証crawlerの遮断
- 将来の収益化検証

本決済・分配・返金・税務・規約対応は、Cloudflare Pay Per CrawlまたはStripe Connect等の正式設計後に扱う。
