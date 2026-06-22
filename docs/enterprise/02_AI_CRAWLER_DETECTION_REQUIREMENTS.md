# AIクローラー検知システム要件

## 目的

企業がAI時代のWeb資産リスクを判断できるように、AI crawlerのアクセス実態、取得対象、policy違反、事業影響、次の施策を提示する。

## 取得すべきデータ

| 区分 | データ | 用途 |
|---|---|---|
| identity | crawler name, operator, verified, detection_id, user_agent | 誰が来ているかを説明 |
| request | timestamp, host, path, method, status_code, country, ASN | いつ・どこに・どうアクセスしたか |
| content | path_pattern, content_type, page_category, content_value_score | 価値あるページが狙われているか |
| transfer | request_count, bytes_transferred, response_size | 帯域・原価・大量取得の検知 |
| policy | robots_status, llms_status, content_signal, matched_rule | 許可・禁止・違反を判定 |
| referral | referrer_domain, destination_pattern, AI referral sessions | AI経由送客があるか |
| risk | unverified, robots_violation, api_path, high_value_content | 経営者向けリスク表示 |
| action | allow, block, pay_or_block, monitor, manual_review | 代理店が提案する施策 |

## 機能要件

1. crawler別、operator別、category別、host別、path別、status code別に集計できる
2. path pattern単位で人気ページ・高リスクページを出せる
3. robots.txt / llms.txt / Content Signal方針と実アクセスを照合できる
4. verified crawlerと未検証crawlerを分けられる
5. 検索目的のcrawlerと学習目的のcrawlerを分けて扱える
6. 403/402/5xxを別々に表示できる
7. CSV exportと月次レポート出力ができる
8. 重要イベントを監査ログとして残せる
9. 代理店、エンド顧客、管理者で見える範囲を分ける
10. 高リスクイベントはSlack/メール通知できる

## UI/UX要件

| 対象 | 見せるもの | 理由 |
|---|---|---|
| 経営者 | 取得された資産、リスク、損失、次アクション | 意思決定に必要 |
| 代理店 | 顧客説明用KPI、提案アクション、CSV | 商談で使う |
| 技術者 | raw event、status、matched rule、user agent | 根拠確認と誤検知修正 |

## デモ反映

`hackall_demo_app` に `AIクローラー検知` 画面を追加した。

- requests / verified率 / blocked・402 / bytes
- 取得すべきデータの6分類
- operator別リスク分布
- path pattern別の狙われ方
- crawler event detail
- robots / policy audit
- 疑似crawlerイベント追加

## 次の実装

1. `crawler_events` テーブル
2. Cloudflare Logpush or GraphQL API連携
3. User-Agent / verified bot正規化辞書
4. path pattern分類
5. robots/llms policy parser
6. 月次レポート出力
