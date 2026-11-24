# サイトの階層構造（プロトタイプ）

## 1. 階層

```
Top（index.html）
├─ Business（business.html）……… 事業の全体像
│   ├─ AirReach（airreach.html）… AI広告（AI検索対策）・提供中
│   └─ Adctor（adctor.html）…… AIの料金所（Pay per Citation／ペイウォール）・研究開発・限定実証
├─ Use Cases（usecases.html）…… 立場から探す
├─ Media（media.html）………… メディア掲載
├─ News（news.html）…………… ニュース・コラム
└─ Company（company.html）…… 会社情報（理念・価値観・会社概要・経営メンバー #members）

全ページ共通：ヘッダー／メニュー（スマホ）／Get In Touch（#contact）／フッター
外部リンク：無料AI検索診断・お問い合わせフォーム・商談予約・料金ページ・規約類（trillion-bank.jp）
```

## 2. 各ページの中身

| ページ | 役割 | 主な中身 |
|---|---|---|
| Top | 全体の入口。各ページへの道案内 | ヒーロー → About（右に文章、ロゴの丸のまわりに丸いボタン：Business・AirReach・Adctor）→ 2つの事業の要約 → Use Cases → Media → News → Company → Our Business → 経営メンバー → Get In Touch |
| Business | 2つの事業の関係を1ページで | 2枚の大きなカード（AirReach／Adctor）→ Our Business（Reach & Return・事業の一覧）→ Use Cases への帯 |
| AirReach | **AI広告**であることが分かる | 「AIの回答で、比較候補に入る」→ 対応AI → AI広告の4つの流れ（表示確認・改善計画・記事作成・結果確認）→ 動く図とサービスのモデル（チャット画面）→ 使い方と料金 → できないこと |
| Adctor | **AIに引用されたら対価が届く「AIの料金所」**であることが分かる | 「AIに引用されたら、対価が届く」→ 料金所のしくみ（動く図：鍵のあるボットは通って記録、鍵のないボットには条件を案内）→ 動く図とサービスのモデル（管理画面）→ Pay per Citation の4つの流れ → 分け方の設計例（80銭／20銭）→ 協業・投資の案内 |
| Use Cases | 立場ごとの入口 | 4つの立場のカード（スクロールで重なる） |
| Media | 出演番組 | 番組の一覧 |
| News | お知らせ・コラム | 最新のコラム → すべて見る（公式サイト） |
| Company | 会社の信頼 | 企業理念（Purpose・Vision・Mission）→ 価値観（5つ）→ 会社概要 → 経営メンバー（一覧＋プロフィール画面） |

## 3. 作り方（同じ内容を二重に持たない）

- **共通部品**は `partials/`（ヘッダー・フッター・Get In Touch・ロゴの部品・浮かぶ部品）。
- **下のページ**は `pages_src/*.html` に、ページ固有の中身だけを書く。トップと同じセクションは `{{section:ID}}` で、トップの index.html から取り込む。
- `python3 tools/build_pages.py` を実行すると、トップの共通部品を更新し、7つのページを作る。いま開いているページのメニューに印が付き、取り込んだセクションの中のトップ向けリンク（#airreach など）は各ページ（airreach.html など）に置き換わる。
- メンバーを直したときは、`tools/build_members.py` → `tools/build_pages.py` の順に実行する。
- 見た目は、トップと同じ `style.css`・`gp-motion.css` に、下のページ用の `site.css` を足している。動きは `main.js`・`gp-motion.js`・`site.js`。

## 4. 書き方で気を付けたこと

- AirReach は「AI広告」と書きつつ、**広告枠の購入ではなく、AI向けの情報整備**であることをページの最初に明記（表示・順位・売上は保証しない）。
- Adctor は「AIに引用されたら対価が届く」と書きつつ、**契約で合意した引用・利用が対象で、すべてのAIの引用を自動で検知・課金する仕組みではない**こと、**研究開発・限定実証の段階**であること、80銭／20銭は**未検証の設計例**であることを明記。
