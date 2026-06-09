# 開発フェーズ管理・納品物チェックリスト

**プロジェクト名:** Adctor PPCW システム  
**発注者:** 株式会社Regalis Japan Group  
**機密区分:** 社外秘

---

## フェーズ全体スケジュール

```
Phase 1: インフラ基盤    [Week 1-4]   ██████████░░░░░░░░░░░░░░
Phase 2: 管理画面コア   [Week 3-8]   ░░░░░░██████████████░░░░
Phase 3: 高度機能        [Week 7-14]  ░░░░░░░░░░░░░░████████████
```

---

## Phase 1: インフラ基盤構築（Week 1〜4）

### 納品物チェックリスト

**1.1 設計書（Week 1中に提出・承認必須）**

- [ ] **インフラ構成図（Terraform/CDK形式）**
  - Cloudflare → AWS間のネットワーク図
  - VPC・サブネット・セキュリティグループ定義
  - ECS・RDS・S3・ALBの配置図
  
- [ ] **データベースER図・テーブル定義書**
  - sites / pricing_master / transactions / users / access_tokens
  - カラム名・データ型・制約・インデックス
  
- [ ] **APIインターフェース仕様書（OpenAPI 3.0形式）**
  - 全エンドポイントのリクエスト/レスポンス定義
  - エラーコード定義

**1.2 実装・検証（Week 2-4）**

- [ ] **Cloudflare Worker本番デプロイ**
  - `wrangler deploy` 成功確認
  - KV Namespace作成（TOKENS バインディング）
  - Wrangler Secrets設定（STRIPE_SECRET_KEY等）
  
- [ ] **AWS VPC・ECS構築**
  - セキュリティグループ: Cloudflare IPレンジのみ許可
  - ECS Task Definition作成
  - Auto Scaling設定（CPU 70%でスケールアウト）
  
- [ ] **Amazon RDS PostgreSQL**
  - Multi-AZ配置
  - 自動バックアップ設定（7日間保持）
  - DBマイグレーション（Alembic）
  
- [ ] **Cloudflare Logpush → S3設定**
  - Logpushジョブ作成（5分間隔）
  - S3バケット作成・IAMロール設定
  - S3ライフサイクルルール（90日後Glacier移行）

### Phase 1 検収テスト

```
テストA: オリジン保護テスト
  1. Cloudflare IPレンジ以外からAWS ALBへ直接curl
  コマンド: curl -v https://{AWS_ALB_DNS}/health
  期待結果: 接続拒否 or 403

テストB: 人間トラフィック通過テスト
  コマンド: curl -H "User-Agent: Mozilla/5.0 Chrome/120" https://{WORKER_DOMAIN}/
  期待結果: HTTP 200（オリジンコンテンツ）

テストC: GPTBot 402テスト
  コマンド: curl -v -H "User-Agent: GPTBot/1.0" https://{WORKER_DOMAIN}/
  期待結果: HTTP 402 + {"x402": {"paymentUrl": "https://checkout.stripe.com/..."}}

テストD: 決済完了→コンテンツ取得テスト
  1. テストCでtoken_idを取得
  2. Stripeテスト環境で決済完了
  3. curl -H "X-Adctor-Token: {token_id}" https://{WORKER_DOMAIN}/
  期待結果: HTTP 200（コンテンツ取得成功）

テストE: Logpush動作確認
  1. 複数のテストアクセスを実行
  2. 5分後にS3バケットを確認
  期待結果: s3://adctor-logs/{date}/ にJSONLファイルが存在
```

---

## Phase 2: 管理画面コア機能開発（Week 3〜8）

### 納品物チェックリスト

**2.1 設計書（Week 3中に提出・承認必須）**

- [ ] **UI/UXデザイン（Figmaワイヤーフレーム）**
  - S-01〜S-10 全画面のワイヤーフレーム
  - コンポーネント定義書
  - レスポンシブ対応方針

**2.2 実装**

- [ ] **認証基盤（AWS Cognito）**
  - メール/パスワード + MFA
  - JWTトークンのNext.js実装

- [ ] **ダッシュボード（S-04）**
  - KPIカード（実APIデータ）
  - 収益グラフ（Recharts）
  - リアルタイムフィード（WebSocket）
  
- [ ] **サイト管理（S-05）**
  - サイト一覧（実DBデータ）
  - 新規登録フロー（Stripe Connect）
  - JSタグ生成・コピー機能
  - ディレクトリ別価格設定CRUD

- [ ] **分析ページ（S-06）**
  - Athena連携（クローラー別統計）
  - 収益レポートCSVエクスポート

- [ ] **外部API連携（全統合）**
  - Unsplash API（画像取得・24時間キャッシュ）
  - IPinfo API（バックエンド統合）
  - Resend API（決済通知メール）
  - Slack Webhook（アラート）

### Phase 2 検収テスト

```
テストF: サイト登録フロー
  1. /dashboard/settings でメール・ドメインを入力
  2. 「登録する」クリック
  期待結果: Stripe Connectオンボーディングリンクが表示

テストG: 価格設定変更
  1. /dashboard/sites で /premium/* の価格を¥2,000に設定
  2. 60秒後にGPTBotでアクセス
  期待結果: 402レスポンスの amount が 2000

テストH: リアルタイムフィード
  1. ダッシュボードを開く
  2. GPTBotでアクセス（別ターミナル）
  期待結果: 3秒以内にダッシュボードのフィードに表示

テストI: Unsplash画像表示
  UNSPLASH_ACCESS_KEY を有効なキーに設定
  期待結果: /lp のヒーロー画像がUnsplash写真に切り替わる

テストJ: 決済完了メール
  Stripeテスト環境で決済完了
  期待結果: 登録メールアドレスに決済通知メール到着
```

---

## Phase 3: 高度機能開発（Week 7〜14）

### 納品物チェックリスト

**3.1 AIクローラー偽装検知**

- [ ] IPinfo APIによるASN判定の実装
- [ ] 挙動フィンガープリント（Cookieなし・JSなし）
- [ ] 連続アクセスパターン検知（Redis rate limiting）
- [ ] 多層スコアリングロジック（スコア3以上でAI判定）

**3.2 GEO最適化（生成AI検索対応）**

- [ ] Schema.org自動付与（Article, FAQPage, HowTo）
- [ ] llms.txt 自動生成エンドポイント
- [ ] AI向けメタタグ自動挿入
- [ ] Cloudflare Worker での HTMLヘッダー書き換え実装

**3.3 ダイナミックプライシング最適化**

- [ ] クローラー別・ページ別収益分析（Athena）
- [ ] 最適価格レコメンデーション（機械学習 or ルールベース）
- [ ] A/Bテスト機能（価格帯の比較）

**3.4 収益分析基盤**

- [ ] AWS Athena クエリテンプレート整備
- [ ] 月次レポート自動生成（PDF/CSV）
- [ ] 収益予測モデル（線形回帰）

### Phase 3 検収テスト

```
テストK: 偽装検知
  1. GPTBotのUAを使い、かつOpenAIのASN IPから30秒で20リクエスト
  期待結果: スコア4でAI判定 → 402応答

テストL: GEO Schema.org
  1. /about（GEO許可設定）にGPTBotでアクセス
  期待結果: HTTPレスポンスボディに<script type="application/ld+json">が含まれる

テストM: 月次レポート
  月末に管理画面でレポート生成をクリック
  期待結果: PDFダウンロードが成功。クローラー別収益・アクセス数が含まれる
```

---

## 品質基準（全フェーズ共通）

### コード品質
- TypeScript: strict mode必須、any禁止
- Python: type hint必須、mypy通過
- テストカバレッジ: 70%以上
- ESLint/Prettier: CI通過必須

### パフォーマンス
- Cloudflare Worker処理時間: 50ms以内
- 管理画面LCP: 2.5秒以内
- API応答時間: 200ms以内（p95）

### セキュリティ
- OWASP Top10対応確認書を提出
- SQLインジェクション: parameterized query必須
- XSS対策: CSP設定必須
- 機密情報: コードへのハードコード禁止
