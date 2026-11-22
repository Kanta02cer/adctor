import Image from "next/image";
import { Noto_Sans_JP, Space_Grotesk } from "next/font/google";
import styles from "./corporate.module.css";
import { AdctorFlow } from "./AdctorFlow";
import { HeroVisual } from "./HeroVisual";
import { LINKS, NEWS } from "./links";
import { LogoSymbol, FRAMES } from "./LogoSymbol";
import { Marquee } from "./Marquee";
import { RevealRoot } from "./Reveal";
import { SiteHeader } from "./SiteHeader";
import { SplitText } from "./SplitText";
import wordmark from "./assets/tb-wordmark.webp";

const notoSansJp = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--tb-font-ja",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--tb-font-en",
});

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className ?? styles.arrowIcon} aria-hidden="true" focusable="false">
      <path d="M3 10 H16 M11 5 L16 10 L11 15" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 20 20" className={styles.arrowIcon} aria-hidden="true" focusable="false">
      <path d="M6 14 L14 6 M7 6 H14 V13" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const PROBLEMS = [
  {
    no: "01",
    title: "予算を付ける根拠がない",
    body: "やらないのは怖い。しかし自社が本当に候補から外れているのか、競合が先行しているのか、今期動くべきかを示す数字がない。",
  },
  {
    no: "02",
    title: "自社でできる範囲が分からない",
    body: "ChatGPTに自社名を聞くことは誰でもできる。だが継続測定・証拠保存・施策前後の比較となると、内製か外注かを判断できない。",
  },
  {
    no: "03",
    title: "AI利用の証跡・対価が残らない",
    body: "コンテンツがAIに読まれても、誰がどう使ったかの記録も対価も残らない。AI広告が始まり、ブラックボックスはさらに増えている。",
  },
];

type Status = "live" | "validating" | "research" | "concept";
const STATUS_LABEL: Record<Status, string> = {
  live: "提供中",
  validating: "検証中",
  research: "研究開発",
  concept: "構想",
};

const ADCTOR_STAGES: { verb: string; name: string; detail: string; status: Status }[] = [
  { verb: "守る", name: "AI Access Gateway", detail: "AIクローラーやAIエージェントのアクセスを判別・制御する", status: "research" },
  { verb: "記録する", name: "Usage Ledger", detail: "誰が・どの情報を・いつ取得したかを台帳に残す", status: "validating" },
  { verb: "正規化する", name: "License & Billing", detail: "契約・ライセンス・価格ルールと結び、将来の請求・分配へつなぐ", status: "concept" },
  { verb: "引用で測る", name: "Pay per Citation", detail: "AIの回答で引用されたことに応じた課金の一形態", status: "research" },
];

function StatusChip({ status }: { status: Status }) {
  return (
    <span className={styles.status} data-status={status}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function CorporateHome() {
  return (
    <RevealRoot className={`${styles.root} ${notoSansJp.variable} ${spaceGrotesk.variable}`}>
      <a href="#main" className={styles.skip}>
        本文へスキップ
      </a>
      <SiteHeader />

      <main id="main">
        {/* ───────── HERO / OPENING ───────── */}
        <section id="top" className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <p className={styles.heroEyebrow}>Trillion Bank — AI Information Infrastructure</p>
              <p className={styles.heroDisplay} aria-hidden="true">
                <span className={styles.mask}>
                  <span style={{ animationDelay: "80ms" }}>Measure,</span>
                </span>
                <span className={styles.mask}>
                  <span style={{ animationDelay: "170ms" }}>Record,</span>
                </span>
                <span className={styles.mask}>
                  <span style={{ animationDelay: "260ms" }}>
                    Return<span className={styles.heroDot}>.</span>
                  </span>
                </span>
              </p>
              <h1 id="hero-title" className={styles.heroTitle}>
                <span>AIから発信者に</span>
                <span>還元をする</span>
                <span>インフラをつくる</span>
              </h1>
              <p className={styles.heroLead}>情報の利用許諾・記録・精算をつなぐ。</p>
              <div className={styles.heroActions}>
                <a href="#mechanism" className={styles.btnPrimary}>
                  Adctorの仕組みを見る
                  <ArrowIcon />
                </a>
                <a href={LINKS.diagnose} className={styles.linkOnDark}>
                  無料でAI検索診断
                  <ExternalIcon />
                </a>
              </div>
            </div>
            <HeroVisual />
          </div>
          <a href="#company" className={styles.scrollCue}>
            <span>Scroll</span>
            <span className={styles.scrollLine} aria-hidden="true" />
          </a>
        </section>

        {/* ───────── MISSION ───────── */}
        <section id="company" className={styles.mission} aria-labelledby="mission-title">
          <div className={styles.container}>
            <p className={styles.eyebrow} data-reveal="">
              Our Mission
            </p>
            <h2 id="mission-title" className={styles.missionTitle} data-reveal="">
              <span>AI革命で、</span>
              <span>
                <span className={styles.underline}>トリリオンの課題</span>を
              </span>
              <span>担う。</span>
            </h2>
            <div className={styles.missionBody} data-reveal="">
              <p>
                AI検索で選ばれる企業を増やし、AIに使われた情報を価値へ変える。
                <br />
                測る（AI集客マーケティング）と、証跡化する（AI情報利用管理）の2事業です。
              </p>
              <p className={styles.missionLinks}>
                <a href={LINKS.mission} className={styles.textLink}>
                  企業理念
                  <ArrowIcon />
                </a>
                <a href={LINKS.company} className={styles.textLink}>
                  企業概要
                  <ArrowIcon />
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* ───────── PROBLEM ───────── */}
        <section className={styles.problem} aria-labelledby="problem-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <SplitText text="Problem" className={styles.display} />
              <div>
                <h2 id="problem-title" className={styles.sectionTitle} data-reveal="">
                  私たちが取り組む課題
                </h2>
                <p className={styles.sectionLead} data-reveal="">
                  AI検索が重要なのは分かる。でも、判断材料がない。
                  <br />
                  そして、AIに使われた情報には、記録も対価も残らない。
                </p>
              </div>
            </div>
            <ol className={styles.problemList}>
              {PROBLEMS.map((p) => (
                <li key={p.no} className={styles.problemItem} data-reveal="">
                  <span className={styles.problemNo}>{p.no}</span>
                  <h3 className={styles.problemTitle}>{p.title}</h3>
                  <p className={styles.problemBody}>{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <Marquee />

        {/* ───────── ADCTOR MECHANISM ───────── */}
        <section id="mechanism" className={styles.mechanism} aria-labelledby="mechanism-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <SplitText text="How Adctor Works" className={styles.display} />
              <div>
                <h2 id="mechanism-title" className={styles.sectionTitle} data-reveal="">
                  Adctorの仕組み
                </h2>
                <p className={styles.sectionLead} data-reveal="">
                  AIによる情報の利用を、条件の提示・利用の記録・対価の精算までひとつにつなぐ。
                  黒はデータ、青はお金の流れです。
                </p>
              </div>
            </div>

            <div data-reveal="">
              <AdctorFlow />
            </div>

            <div className={styles.stages} data-reveal="">
              <div className={styles.stagesHead}>
                <h3 className={styles.stagesTitle}>開発の現在地</h3>
                <p className={styles.stagesNote}>
                  Adctorは研究開発・限定PoC段階のプログラムです。決済・回収・分配までを自動で行う仕組みとして完成したものではなく、
                  未知のAIボットのすべてを判別するものでもありません。
                </p>
              </div>
              <ol className={styles.stageList}>
                {ADCTOR_STAGES.map((s, i) => (
                  <li key={s.name} className={styles.stage}>
                    <span className={styles.stageNo}>{String(i + 1).padStart(2, "0")}</span>
                    <p className={styles.stageVerb}>{s.verb}</p>
                    <p className={styles.stageName}>{s.name}</p>
                    <p className={styles.stageDetail}>{s.detail}</p>
                    <StatusChip status={s.status} />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ───────── BUSINESS ───────── */}
        <section id="business" className={styles.business} aria-labelledby="business-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <SplitText text="Business" className={styles.display} />
              <div>
                <h2 id="business-title" className={styles.sectionTitle} data-reveal="">
                  事業
                </h2>
                <p className={styles.sectionLead} data-reveal="">
                  AIに使われた情報を記録し、対価へつなぐAdctor。AI検索で見つかり、選ばれる状態をつくるAirReach。
                </p>
              </div>
            </div>
          </div>

          {/* 01 Adctor */}
          <article className={styles.panelAdctor} aria-labelledby="biz-adctor">
            <div className={styles.panelInner}>
              <div className={styles.panelText} data-reveal="">
                <p className={styles.panelEyebrow}>Business 01 · AI Usage Accounting</p>
                <h3 id="biz-adctor" className={styles.panelName}>
                  Adctor
                </h3>
                <p className={styles.panelCategory}>
                  AI情報利用管理 <StatusChip status="research" />
                </p>
                <p className={styles.panelBody}>
                  AIクローラーやAI Agentによるコンテンツのアクセス・取得を証跡として記録し、契約・ライセンス・価格ルールと紐づけ、
                  将来的な請求へ接続する基盤を研究開発しています。
                </p>
                <ul className={styles.tagList}>
                  <li>Pay per Crawl</li>
                  <li>Usage Ledger</li>
                  <li>Evidence</li>
                </ul>
                <p className={styles.panelFor}>
                  AIに読まれても対価・証跡が残らないメディア・専門データベースの方、安定して監査可能な日本語データを必要とするAI・RAG・MCP事業者の方へ。
                </p>
                <div className={styles.panelActions}>
                  <a href="#mechanism" className={styles.btnInk}>
                    Adctorの仕組みを見る
                    <ArrowIcon />
                  </a>
                  <a href={LINKS.adctor} className={styles.textLink}>
                    Adctor / Pay per Crawl の詳細
                    <ExternalIcon />
                  </a>
                </div>
              </div>
              <div className={styles.panelArt} aria-hidden="true" data-reveal="">
                <svg viewBox="-20 20 460 290" className={styles.panelArtSvg}>
                  <g fill="none" stroke="#0B0F17" strokeWidth="2">
                    {FRAMES.map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </g>
                  <g fill="none" stroke="#0B0F17" strokeWidth="1" opacity="0.25">
                    {FRAMES.map((d) => (
                      <path key={d} d={d} transform="translate(-14 10)" />
                    ))}
                  </g>
                  <path
                    d="M-20 165 H105 C130 165 140 137 166 137 C200 137 216 191 256 191 C286 191 296 165 322 165 H440"
                    fill="none"
                    stroke="#164BFF"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </article>

          {/* 02 AirReach */}
          <article id="airreach" className={styles.panelAirreach} aria-labelledby="biz-airreach">
            <div className={styles.panelInner}>
              <div className={styles.panelText} data-reveal="">
                <p className={styles.panelEyebrow}>Business 02 · AI Search Growth</p>
                <h3 id="biz-airreach" className={styles.panelName}>
                  AirReach
                </h3>
                <p className={styles.panelCategory}>
                  AI集客マーケティング <StatusChip status="live" />
                </p>
                <p className={styles.panelLeadLarge}>
                  そのホームページ、
                  <br />
                  AI検索で見つけてもらえる状態ですか？
                </p>
                <p className={styles.panelBody}>
                  AI検索で見つかり、選ばれ、問い合わせや予約につなげる。AirReach 無料診断で現状を調べ、AirReach Consultingで測定・改善・再計測します。
                </p>
                <div className={styles.panelActions}>
                  <a href={LINKS.diagnose} className={styles.btnWhite}>
                    無料でAI検索診断
                    <ArrowIcon />
                  </a>
                  <span className={styles.panelMicro}>URLを入れるだけ・登録不要・約30秒</span>
                </div>
              </div>
              <ul className={styles.productList} data-reveal="">
                <li>
                  <a href={LINKS.diagnose} className={styles.productRow}>
                    <span className={styles.productName}>AirReach 無料診断</span>
                    <span className={styles.productDesc}>
                      URLから約30秒で、AI検索・Google検索で見つけてもらうための情報がそろっているかを100点満点で診断します。
                    </span>
                    <ArrowIcon className={styles.productArrow} />
                  </a>
                </li>
                <li>
                  <a href={LINKS.airreachConsulting} className={styles.productRow}>
                    <span className={styles.productName}>AirReach Consulting</span>
                    <span className={styles.productDesc}>
                      AI回答での候補入り・勝敗・引用元を、証拠付きで測定。施策前後の比較と改善の優先順位づけを伴走します。
                    </span>
                    <ArrowIcon className={styles.productArrow} />
                  </a>
                </li>
                <li>
                  <a href={LINKS.airreachTools} className={styles.productRow}>
                    <span className={styles.productName}>AirReach Tools</span>
                    <span className={styles.productDesc}>
                      ご自身でAI検索での見え方を測って直す月額のサービス。月額19,800円（税別）・初期費用0円。
                    </span>
                    <ArrowIcon className={styles.productArrow} />
                  </a>
                </li>
                <li>
                  <a href={LINKS.airreachAgency} className={styles.productRow}>
                    <span className={styles.productName}>AirReach Tools（代理店向け）</span>
                    <span className={styles.productDesc}>
                      代理店が、お客様のドメインごとにAI検索での見え方を測って直す月額のサービス。お申し込みはお問い合わせから。
                    </span>
                    <ArrowIcon className={styles.productArrow} />
                  </a>
                </li>
              </ul>
            </div>
            <p className={styles.panelDisclaimer}>
              点数や測定結果は情報整備と判断の目安です。AI回答への掲載・検索順位・問い合わせ数・売上などの成果を保証するものではありません。
            </p>
          </article>
        </section>

        {/* ───────── NEWS ───────── */}
        <section id="news" className={styles.news} aria-labelledby="news-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <SplitText text="News" className={styles.display} />
              <div className={styles.newsHeadRight}>
                <h2 id="news-title" className={styles.sectionTitle} data-reveal="">
                  ニュース・コラム
                </h2>
                <a href={LINKS.insights} className={styles.textLink} data-reveal="">
                  コラム一覧
                  <ArrowIcon />
                </a>
              </div>
            </div>
            <ul className={styles.newsList}>
              {NEWS.map((n) => (
                <li key={n.href} data-reveal="">
                  <a href={n.href} className={styles.newsRow}>
                    <time className={styles.newsDate} dateTime={n.date.replaceAll(".", "-")}>
                      {n.date}
                    </time>
                    <span className={styles.newsCat}>{n.category}</span>
                    <span className={styles.newsTitle}>{n.title}</span>
                    <ArrowIcon className={styles.newsArrow} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── CONTACT ───────── */}
        <section id="contact" className={styles.contact} aria-labelledby="contact-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <SplitText text="Contact" className={styles.displayOnDark} />
              <div>
                <h2 id="contact-title" className={styles.sectionTitle} data-reveal="">
                  まずは、ご相談ください。
                </h2>
                <p className={styles.sectionLeadOnDark} data-reveal="">
                  Adctorの導入や限定PoC、AirReach Consultingの導入・販売代理店のご検討、取材・資料送付のご依頼まで、フォームから受け付けています。
                </p>
              </div>
            </div>
            <ul className={styles.contactList}>
              <li data-reveal="">
                <a href={LINKS.contact} className={styles.contactRow}>
                  <span className={styles.contactEn}>Form</span>
                  <span className={styles.contactName}>お問い合わせフォーム</span>
                  <span className={styles.contactDesc}>導入・PoC・提携・取材・その他のご質問</span>
                  <ArrowIcon className={styles.contactArrow} />
                </a>
              </li>
              <li data-reveal="">
                <a href={LINKS.meeting} className={styles.contactRow}>
                  <span className={styles.contactEn}>Meeting</span>
                  <span className={styles.contactName}>商談を予約する</span>
                  <span className={styles.contactDesc}>詳細の説明が必要な場合はオンライン商談で</span>
                  <ArrowIcon className={styles.contactArrow} />
                </a>
              </li>
              <li data-reveal="">
                <a href={LINKS.diagnose} className={styles.contactRow}>
                  <span className={styles.contactEn}>Free Check</span>
                  <span className={styles.contactName}>無料でAI検索診断</span>
                  <span className={styles.contactDesc}>URLを入れるだけ・登録不要・約30秒</span>
                  <ArrowIcon className={styles.contactArrow} />
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* ───────── FOOTER ───────── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <a href="#top" className={styles.footerLogo} aria-label="Trillion Bank トップへ">
                <LogoSymbol className={styles.footerSymbol} frameColor="#F5F4F0" />
                <Image src={wordmark} alt="" className={styles.footerWordmark} sizes="220px" />
              </a>
              <p className={styles.footerCompany}>株式会社Trillion Bank（トリリオンバンク）</p>
              <address className={styles.footerAddress}>
                〒102-0083 東京都千代田区麹町六丁目2番1号
                <br />
                麹町サイトビル6階 ROOMZ
              </address>
            </div>
            <nav className={styles.footerNav} aria-label="フッターナビゲーション">
              <div>
                <p className={styles.footerNavHead}>Business</p>
                <a href={LINKS.business}>事業概要</a>
                <a href={LINKS.adctor}>Adctor / Pay per Crawl</a>
                <a href={LINKS.airreachConsulting}>AirReach Consulting</a>
                <a href={LINKS.airreachTools}>AirReach Tools</a>
                <a href={LINKS.airreachAgency}>AirReach Tools（代理店向け）</a>
              </div>
              <div>
                <p className={styles.footerNavHead}>Company</p>
                <a href={LINKS.mission}>企業理念</a>
                <a href={LINKS.company}>企業概要</a>
                <a href={LINKS.insights}>コラム</a>
              </div>
              <div>
                <p className={styles.footerNavHead}>Contact</p>
                <a href={LINKS.meeting}>商談を予約する</a>
                <a href={LINKS.contact}>お問い合わせフォーム</a>
                <a href={LINKS.diagnose}>無料でAI検索診断</a>
              </div>
            </nav>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerNote}>※ 当社は銀行業を営む会社ではありません。</p>
            <ul className={styles.footerLegal}>
              <li>
                <a href={LINKS.privacy}>プライバシーポリシー</a>
              </li>
              <li>
                <a href={LINKS.terms}>利用規約</a>
              </li>
              <li>
                <a href={LINKS.security}>情報セキュリティ</a>
              </li>
              <li>
                <a href={LINKS.editorial}>編集方針</a>
              </li>
            </ul>
            <p className={styles.footerCopy}>© 2026 Trillion Bank</p>
          </div>
        </div>
      </footer>
    </RevealRoot>
  );
}
