# PPC / Pay Per Crawl 要件

PPCは初期売上の本線ではなく、検証可能な将来オプションとして扱います。

必要な要素:

- path pattern別価格ルール
- crawler identity確認
- exact price / max price判定
- 402 / allow / block / manual reviewのdecision engine
- 支払い意思ヘッダーと署名確認の保存
- PPC event ledger
- candidate / rejected / blocked / settledの状態管理
- 想定GMVではなく受諾率込みの保守値

デモでは `PPC設計` 画面に、価格ルール、402 decision simulator、PPC event ledgerを追加しています。

本番化では、まず `ppc_price_rules`、`ppc_events`、dry-run API、CSV、月次レポートを実装し、決済・精算・分配は専門レビュー後に接続します。
