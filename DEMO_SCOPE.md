# Demo Scope

## このデモで実装していること

- 疑似ログイン
- 代理店の売上、利用料、粗利、API原価の可視化
- 代理店配下のクライアント追加
- キーワード登録
- 疑似AI検索計測
- citation結果追加
- CSV出力
- レポート切替
- 請求書発行、入金確認の疑似操作
- 導入チェックリスト
- Adctor / PPC / 402イベントの将来構想表示

## このデモで実装していないこと

- 本物の認証
- 本物のDB保存
- 本物のPerplexity / Gemini / OpenAI API呼び出し
- 本物のGCP Cloud Tasks連携
- Stripe決済
- PDF生成
- 顧客別権限制御
- 法務、会計、セキュリティ保証

## 営業時の言い方

この画面は営業デモです。本番では、現在Code Xで進めているFastAPI、PostgreSQL、Perplexity API、GCP Cloud Tasksの実装ラインに接続します。

PPC/x402は売上保証として見せず、将来オプションとして扱います。初期の売上柱は、代理店向けの診断SaaS、月次レポート、AEO/GEO運用です。
