/** 現行サイト（trillion-bank.jp）の実在ページへのリンク。 */
const ORIGIN = "https://trillion-bank.jp";

export const LINKS = {
  diagnose: `${ORIGIN}/#diagnose`,
  contact: `${ORIGIN}/trillionbank/contact/`,
  meeting: `${ORIGIN}/trillionbank/meeting/`,
  business: `${ORIGIN}/trillionbank/business/`,
  adctor: `${ORIGIN}/trillionbank/business/pay-per-crawl/`,
  airreachConsulting: `${ORIGIN}/trillionbank/business/hack2/`,
  airreachTools: `${ORIGIN}/trillionbank/business/airreach-selfserve/`,
  airreachAgency: `${ORIGIN}/trillionbank/business/airreach-tools-agency/`,
  mission: `${ORIGIN}/trillionbank/mission/`,
  company: `${ORIGIN}/trillionbank/company/`,
  insights: `${ORIGIN}/trillionbank/insights/`,
  privacy: `${ORIGIN}/trillionbank/privacy/`,
  terms: `${ORIGIN}/trillionbank/terms/`,
  security: `${ORIGIN}/trillionbank/security/`,
  editorial: `${ORIGIN}/trillionbank/insights/editorial-policy/`,
} as const;

export const NEWS = [
  {
    date: "2026.11.11",
    category: "AI検索・SEO",
    title: "Googleの2026年11月コアアップデート開始｜AI検索施策の効果と流入変動を分けて判断する",
    href: `${ORIGIN}/trillionbank/news/google-november-2026-core-update/`,
  },
  {
    date: "2026.11.04",
    category: "AIデータ権利",
    title: "Pay per Citationとは？AI引用課金とCloudflare Pay Per Useの違い",
    href: `${ORIGIN}/trillionbank/news/pay-per-citation-ai-usage/`,
  },
  {
    date: "2026.11.04",
    category: "技術解説",
    title: "Paywallとサイバーセキュリティ｜公式の実装事例から考える有料コンテンツの守り方",
    href: `${ORIGIN}/trillionbank/news/paywall-cybersecurity/`,
  },
  {
    date: "2026.11.04",
    category: "技術解説",
    title: "Cloudflareとは？CDN・WAF・WorkersとAI時代の役割を整理",
    href: `${ORIGIN}/trillionbank/news/cloudflare-overview/`,
  },
] as const;
