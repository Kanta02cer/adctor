import type { Metadata } from "next";
import { CorporateHome } from "@/components/corporate/CorporateHome";
import favicon from "@/components/corporate/assets/tb-favicon-192.png";

const description =
  "株式会社Trillion Bankは、AIから発信者に還元をするインフラをつくります。Adctorで情報の利用許諾・記録・精算をつなぎ、AirReachでAI検索での見つかり方を測定・改善します。";

export const metadata: Metadata = {
  title: "株式会社Trillion Bank｜AIから発信者に還元をするインフラをつくる",
  description,
  icons: { icon: favicon.src, apple: favicon.src },
  openGraph: {
    title: "株式会社Trillion Bank",
    description,
    siteName: "株式会社Trillion Bank",
    locale: "ja_JP",
    type: "website",
    images: ["https://trillion-bank.jp/images/hero/tb-logo-color.webp"],
  },
};

export default function Home() {
  return <CorporateHome />;
}
