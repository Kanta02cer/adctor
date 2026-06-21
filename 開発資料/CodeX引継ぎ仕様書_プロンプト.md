# Code X 開発引継ぎ仕様書 ＆ 指示プロンプト

本資料は、フロントエンドのダッシュボードデモ（静的ホスティング対応）の構築完了に伴い、バックエンドおよびインフラの実装を次世代AIエージェントである **Code X** へ引き継ぐための仕様書兼指示プロンプトです。

---

## 1. 開発ステータスと現在の資産

### フロントエンド資産
- **リポジトリ**: `https://github.com/Kanta02cer/adctor.git` (`main` ブランチ)
- **ダッシュボード画面**: [frontend/src/app/dashboard/page.tsx](file:///Users/wantan/adctor/frontend/src/app/dashboard/page.tsx)
- **HackⅡ 画面**: [frontend/src/app/dashboard/hackii/page.tsx](file:///Users/wantan/adctor/frontend/src/app/dashboard/hackii/page.tsx)
  - クライアント切り替え（マルチテナント）、手動計測トリガー、RechartsによるSOV・推移チャート、L1詳細表示パネル、キーワード追加/競合追加削除フォームがすでにインタラクティブなモックとして実装済み。
- **デモラン用ダッシュボード**: [frontend/src/app/regalis/page.tsx](file:///Users/wantan/adctor/frontend/src/app/regalis/page.tsx)
- **静的ビルド設定**: [frontend/next.config.ts](file:///Users/wantan/adctor/frontend/next.config.ts) で `output: "export"`, `basePath: "/adctor"` が適用済み。

### 設計・資料資産
- `開発資料/` ディレクトリ配下:
  - `HackII_要望書.md` (詳細なデータ定義 L1〜L4、機能要件)
  - `HackII_データ定義・取得仕様書_v1.0.pdf`
  - `HackII_開発総合仕様書_v2.0.pdf`

---

## 2. Code X に引き継ぐ「やるべきことリスト」

Code X は、フロントエンドのモック状態から**本番運用のバックエンド・データベース・外部API連携**を構築するタスクを担当します。

### タスク 1: PostgreSQL データベーススキーマの構築
- `要望書.md`のデータモデルに基づき、データベーススキーマを決定・適用する。
- 以下のテーブルを作成する：
  1. `accounts` (アカウント情報、プラン)
  2. `projects` (クライアント別の監視サイト、ターゲットドメイン)
  3. `competitors` (競合ドメイン、複数登録可)
  4. `keywords` (監視対象キーワード、検索Vol、AI質問テンプレート)
  5. `citation_results` (キーワード×実行日ごとの計測レコード。`citations_raw` を JSONB 形式で丸ごと保存し、`is_cited`, `cited_url`, `cited_position` を抽出して保存)

### タスク 2: FastAPI バックエンドエンドポイントの実装
- モック化されているフロントエンドと通信するAPIの実装。
- **エンドポイント仕様**:
  - `GET /api/v1/projects`: アカウントに紐づくプロジェクト一覧の取得
  - `POST /api/v1/projects/{project_id}/keywords`: 新規キーワード登録・CSVインポート
  - `DELETE /api/v1/projects/{project_id}/competitors/{id}`: 競合ドメインの削除
  - `GET /api/v1/projects/{project_id}/sov-trend`: 指定期間のSOV推移（L3）データの集計返却
  - `POST /api/v1/projects/{project_id}/crawl`: 手動計測ジョブのトリガー（非同期タスクとしてキューへ投入）

### タスク 3: GCP Cloud Tasks + Cloud Run による分散キュー制御の構築
- Yamazaki-san（山崎氏）提案のアーキテクチャをベースとする。
- LLM API（Perplexity, Gemini, OpenAI）の呼び出しを、エンジン別の Cloud Tasks キューで制御。
- キューごとに最大同時実行数、最大dispatch/sec、指数バックオフを設定。
- APIから `429 (Too Many Requests)` を受け取ったワーカーは、該当するエンジンキューのみを一時停止（Pause）または減速させ、他のエンジンの測定を阻害しない自己修復ロジックを実装。

### タスク 4: Perplexity API / クローラー解析モジュールの実装
- Perplexity API (`sonar-medium-online` 等) をコールするクライアントを実装。
- レスポンス内の `citations` 配列を取得し、自社ドメイン（`target_domain`）および競合ドメイン（`competitors`）と部分一致比較を行い、`is_cited` (真偽値)、`cited_url` (ヒットしたURL)、`cited_position` (ヒットしたインデックス+1) をパースしてDBに保存。

### タスク 5: フロントエンドとのAPI結合
- フロントエンド [frontend/src/app/dashboard/hackii/page.tsx](file:///Users/wantan/adctor/frontend/src/app/dashboard/hackii/page.tsx) のインメモリState（モックデータ）を、FastAPIのAPIリクエストおよびWebSocket/Server-Sent Eventsによる進捗更新に置き換える。

---

## 3. 作成するべき資料・仕様決定項目

Code X が実装に入る前に、または実装の初期ステップとして以下の仕様を決定し、ドキュメントとして整理します。

| 項目 | 決定するべき仕様・作成する資料 | 確定している仕様（そのまま引継ぎ） |
|---|---|---|
| **APIコスト設計** | キーワード数×実行頻度に伴うAPI料金の試算。バッチ実行間隔の設定（週1回想定）。 | 課金上限・予算アラートをバックエンド側に仕込む。 |
| **GCP構成書** | Cloud Tasks と Cloud Run のIAM権限、およびVPCコネクタ接続図。 | PostgreSQLはGCP Cloud SQLを使用。 |
| **例外処理方針** | 生成AIが「回答なし」や「出典URLなし（citations空）」を返した際のエラー判定基準。 | 生の応答JSONはすべて `citations_raw` (JSONB) に格納する。 |

---

## 4. Code X 向けシステム設定 ＆ 開発指示プロンプト

Code X が最初に入力として読み込むことで、迷わず開発を開始できる「プロンプトテンプレート」です。以下の内容をコピーして Code X に指示してください。

```markdown
# Adctor / HackⅡ バックエンド・キュー連携実装指示書

あなたは強力な開発エージェント「Code X」です。
現在、AI検索測定プラットフォーム「Adctor」および「HackⅡ」のフロントエンドモック画面（Next.js）が構築され、GitHub Pagesへの静的デプロイ設定まで完了しています。
あなたのタスクは、本番運用可能なバックエンド（FastAPI）、永続化DB（PostgreSQL）、およびレートリミットに耐えうるGCPベースのキューシステムを構築することです。

## 1. 開発コンテキスト
- プロジェクトルート: `/Users/wantan/adctor`
- フロントエンド: `/Users/wantan/adctor/frontend` (Next.js 15+, Tailwind, TS)
- バックエンド: `/Users/wantan/adctor/backend` (FastAPI, Python)
- 設計資料: `開発資料/` ディレクトリ配下に「HackII_要望書.md」およびPDF仕様書が配置されています。

## 2. 技術要件
- **Web Framework**: FastAPI (非同期 SQLAlchemy + PostgreSQL)
- **DB**: PostgreSQL (JSONBカラムをフル活用)
- **Queue/インフラ**: Google Cloud Platform (GCP)
  - 実装第一候補: **Cloud Tasks + Cloud Run Worker**
  - エンジン別キュー（Perplexity, Gemini, OpenAI）に分割してレートリミットを制御。
  - 429発生時は対象エンジンキューのみを減速/一時停止し、他エンジンには影響させない。
- **AEOパースロジック**: Perplexity APIの `citations` 配列から、自社ドメイン・競合ドメインの出現有無・位置をパースし、DBへ書き込む。

## 3. 開発フェーズとステップ

### ステップ 1: DBスキーマの実装
`開発資料/HackII_要望書.md` の §5 のデータモデル（accounts, projects, competitors, keywords, citation_results）に基づき、SQLAlchemyモデルを作成してください。
`citation_results` テーブルには、生のレスポンスを保存する `citations_raw` (JSONB) を必ず定義してください。

### ステップ 2: エンジン別 Cloud Tasks 連携クラスの実装
APIコール用のタスクを各キューにディスパッチするクラスを作成してください。
また、ローカル開発・検証のために、Cloud Tasksのモックエミュレータ（またはCelery/Redisでのローカル代替シミュレータ）を設定し、並行度制御と429発生時の個別一時停止挙動が動作することを示すテストコードを作成してください。

### ステップ 3: クローラーパース関数のテスト作成
`citations`配列から自社ドメイン、競合ドメインを検出するパーサーロジックを作成し、テストコードで期待通り動作することを確認してください（特にヒットしなかった場合、複数ヒットした場合、大文字小文字の差異などのエッジケースに対応）。

### ステップ 4: FastAPI エンドポイント & フロントエンド連携
ダッシュボード画面 [frontend/src/app/dashboard/hackii/page.tsx] のモックStateとAPIエンドポイントを接続し、実際にDBのデータが反映され、手動計測トリガーで非同期キューが回ることを確認してください。

---
準備ができたら、まずは「ステップ 1: DBスキーマの実装」におけるSQLAlchemyモデルコードの提案から開始してください。
```
