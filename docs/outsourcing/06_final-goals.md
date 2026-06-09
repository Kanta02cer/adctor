# 最終目標・成功指標定義書

**プロジェクト名:** Adctor PPCW システム  
**作成日:** 2026年6月9日  
**目的:** 本システムが「完成した」とはどういう状態かを明確に定義する

---

## 1. ビジョンと最終ゴール

### 1.1 一言で言うと

> **「あらゆるWebサイトが、AIに読まれるたびに収益を得られる世界を作る」**

### 1.2 最終的に動くシステムの姿

```
【完成形のユーザー体験】

① サイトオーナー（例: テックメディア運営者）
  → Adctor.ioにアクセス
  → ドメイン登録・Stripe Connect設定（5分）
  → JSタグをサイトに貼り付け（2行のコード）
  → 翌日からAIクローラーが来るたびに¥800が自動入金

② AIシステム（例: OpenAI GPTBot）
  → クライアントのサイトにアクセス
  → HTTP 402を受信
  → Stripeで自動決済（人間の操作不要・M2M）
  → アクセストークンで1時間コンテンツ閲覧

③ Adctor管理者（井上氏）
  → ダッシュボードで全サイトの収益を一元管理
  → 新規AIクローラーの出現をSlackで即知
  → 月次レポートで収益予測を確認
```

---

## 2. 機能の完成定義（Done = Done）

### 2.1 コア機能（Phase 1 完了 = 最低限の本番稼働）

| 機能 | 完成の定義 |
|------|-----------|
| AIクローラー検知 | GPTBot/ClaudeBot/PerplexityBot でアクセスすると必ず402が返る |
| 人間通過 | Chrome/Safari/Firefoxのブラウザは正常にサイトが見える |
| Stripe決済 | テスト環境でカード番号4242-4242-4242-4242で決済が通る |
| トークン発行 | 決済完了後、X-Adctor-Tokenで1時間アクセスできる |
| Webhook | Stripe決済イベントがバックエンドに届き、KVにトークンが保存される |
| オリジン保護 | CloudflareなしでAWSに直接アクセスすると弾かれる |

### 2.2 管理画面機能（Phase 2 完了 = ビジネス稼働）

| 機能 | 完成の定義 |
|------|-----------|
| サイト登録 | 5分以内にAPIキーとStripe ConnectリンクがUIで取得できる |
| JSタグ | コードをコピーして貼るだけで動く（ドキュメント不要） |
| 価格設定 | 管理画面で¥500に変更 → 60秒後に実際の402が¥500になる |
| ダッシュボード | 過去30日の収益・クローラー種別・人気ページが見える |
| リアルタイム | AIアクセスが管理画面に3秒以内に表示される |
| メール通知 | 決済完了時に登録メールに通知が届く |
| Unsplash画像 | LP・管理画面にUnsplashの写真が表示される |

### 2.3 高度機能（Phase 3 完了 = 競合優位確立）

| 機能 | 完成の定義 |
|------|-----------|
| 偽装検知 | Chrome UA + OpenAI ASN + 連続アクセスでAI判定される |
| GEO | 無料開放ページにSchema.orgが自動付与されている |
| ログ分析 | Athena SQLでクローラー別・ページ別の収益がクエリできる |
| 価格最適化 | 「このページは¥1,200が最適です」というレコメンドが出る |
| 月次レポート | PDFで自動生成され、メールで届く |

---

## 3. KPI（成功指標）

### 3.1 技術KPI

| 指標 | 目標値 | 測定方法 |
|------|-------|---------|
| AI検知精度 | 95%以上 | 既知UA50種でテスト |
| 誤検知率（人間をAIと判定） | 0.1%以下 | Chrome/Safari/Firefoxでテスト |
| Edge処理レイテンシ | +10ms以下 | Cloudflare Analytics |
| 管理画面LCP | 2.5秒以下 | Lighthouse |
| 稼働率 | 99.9%以上 | CloudWatch |
| 決済成功率 | 98%以上 | Stripe Dashboard |

### 3.2 ビジネスKPI（6ヶ月後の目標）

| 指標 | 目標値 |
|------|-------|
| 導入サイト数 | 100サイト |
| 月間AIアクセス件数（全サイト合計） | 500,000件 |
| 月間GMV（決済総額） | ¥10,000,000 |
| Adctor月間収益（20%） | ¥2,000,000 |
| サイトオーナー平均月収 | ¥80,000/サイト |
| NPS（サイトオーナー満足度） | 50以上 |

---

## 4. 非ゴール（作らないもの）

本システムが**意図的に含まない**機能：

- ❌ 人間ユーザーへの課金（サブスクリプション）
- ❌ コンテンツ管理システム（CMS）
- ❌ SEO最適化ツール（GEOの副作用はあるが主目的でない）
- ❌ 仮想通貨・暗号資産決済（将来検討だが現フェーズ対象外）
- ❌ モバイルアプリ
- ❌ 自社サイトのコンテンツ生成

---

## 5. リスクと対策

| リスク | 発生確率 | 対策 |
|-------|---------|------|
| AIがHTTP 402を無視して再試行 | 中 | ブラックリスト登録・IPブロック |
| UA偽装でバイパス | 高 | 多層検知（ASN+挙動+UA） |
| Stripe M2M決済の規約変更 | 低 | x402プロトコルで代替決済に対応 |
| Cloudflare PPCWの仕様変更 | 低 | 独自実装（Worker）でフォールバック |
| AIが払わない経営判断 | 中 | 無料GEOページで誘導→有料への転換促進 |
| 日本の法規制 | 低 | 「技術的アクセス制限」として合法（要定期確認） |

---

## 6. ロードマップ（全体像）

```
2026 Q2: Phase 1 完了
  ✓ Cloudflare Worker本番稼働
  ✓ Stripe決済エンドツーエンド動作
  ✓ AWS本番インフラ構築
  
2026 Q3: Phase 2 完了
  ✓ 管理画面MVP本番稼働
  ✓ 外部API統合（Unsplash/IPinfo/Resend/Slack）
  ✓ 初期10サイト導入・実収益確認
  ✓ ベータテスト開始（招待制）
  
2026 Q3-Q4: Phase 3 完了
  ✓ 偽装検知・GEO・分析基盤
  ✓ 100サイト突破
  ✓ 月間GMV ¥10M達成
  
2026 Q4〜: スケールアップ
  → 米国市場展開（Sam Altman、Dario Amodei へのプレゼン）
  → Cloudflare公式パートナーシップ交渉
  → シリーズAラウンド検討
```

---

## 7. 最終確認テストシナリオ（Go-Live判定）

本番リリースの判定は以下の全シナリオ通過を必須とします：

```bash
# シナリオ1: 人間はブロックされない
curl -s -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0" \
  https://adctor.io/ | grep "200"
# 期待: 200 OK

# シナリオ2: GPTBotは402を受け取る
curl -s -o /dev/null -w "%{http_code}" \
  -H "User-Agent: GPTBot/1.0" \
  https://adctor.io/blog/test-article
# 期待: 402

# シナリオ3: 402レスポンスにStripe URLが含まれる
curl -s -H "User-Agent: ClaudeBot/1.0" https://adctor.io/ | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(d['payment_required']['payment_url'])"
# 期待: https://checkout.stripe.com/... が表示される

# シナリオ4: 決済後にコンテンツが取得できる
TOKEN=$(curl -s -X POST https://api.adctor.io/api/v1/check-access \
  -H "User-Agent: GPTBot/1.0" | python3 -c "import sys,json; print(json.load(sys.stdin)['payment_required']['token_id'])")
# （Stripeテスト決済を実行）
curl -s -H "User-Agent: GPTBot/1.0" -H "X-Adctor-Token: $TOKEN" \
  https://adctor.io/blog/test-article
# 期待: 200 OK + コンテンツ

# シナリオ5: Cloudflare迂回はブロック
curl -s -o /dev/null -w "%{http_code}" https://{AWS_ORIGIN_IP}/health
# 期待: 403 or Connection Refused

# シナリオ6: 管理画面で収益が見える
# （ブラウザで https://adctor.io/dashboard を開いてシナリオ2-4の収益が表示されることを確認）
```

---

*「AIが払うかどうか」を確認するため、Wells Fargo、SoftBank Vision Fund、YCombinator等のバックアップを持つ主要AI企業（OpenAI、Anthropic等）の事業方針について現地調査を2026年中に実施予定。*
