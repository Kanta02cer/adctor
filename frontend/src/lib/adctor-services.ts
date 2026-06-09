/**
 * 外部APIキー不要の内製サービス群
 *
 * - ImageService   : Picsum Photos (無制限・無料・登録不要) で高品質画像を提供
 * - NotifyService  : アプリ内リアルタイム通知 (Slack代替)
 * - EmailService   : メールプレビューモーダル (Resend代替)
 * - BotAnalyzer    : User-Agent + ASN パターンで Bot 判定 (IPinfo代替)
 */

// ── 画像サービス ──────────────────────────────────────────────────────────────
export type AdctorImage = {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  author: string;
};

const IMAGE_SEEDS: Record<string, string[]> = {
  technology: ["tech1","ai2","data3","cloud4","network5","server6"],
  business:   ["biz1","office2","meeting3","desk4","city5","finance6"],
  abstract:   ["abs1","pattern2","geo3","wave4","glow5","dark6"],
  hero:       ["hero1","hero2","hero3","hero4","hero5","hero6"],
};

export function getImages(query: string = "technology", count: number = 6): AdctorImage[] {
  const seeds = IMAGE_SEEDS[query] ?? IMAGE_SEEDS.technology;
  return Array.from({ length: count }, (_, i) => {
    const seed = seeds[i % seeds.length];
    const w = 1200, h = 630;
    return {
      id: `${seed}-${i}`,
      url: `https://picsum.photos/seed/${seed}/1200/630`,
      thumb: `https://picsum.photos/seed/${seed}/400/300`,
      alt: `${query} image ${i + 1}`,
      author: "Picsum Photos",
    };
  });
}

export function getHeroImage(index: number = 0): string {
  const seeds = IMAGE_SEEDS.hero;
  return `https://picsum.photos/seed/${seeds[index % seeds.length]}/1920/1080`;
}

// ── 通知サービス (Slack代替) ──────────────────────────────────────────────────
export type Notification = {
  id: string;
  type: "payment" | "bot" | "alert" | "info";
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
};

type Listener = (notifications: Notification[]) => void;

class NotificationStore {
  private notifications: Notification[] = [];
  private listeners: Listener[] = [];

  subscribe(fn: Listener) {
    this.listeners.push(fn);
    fn([...this.notifications]);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  push(n: Omit<Notification, "id" | "timestamp" | "read">) {
    const note: Notification = {
      ...n,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date(),
      read: false,
    };
    this.notifications = [note, ...this.notifications].slice(0, 50);
    this.listeners.forEach(fn => fn([...this.notifications]));
    return note;
  }

  markAllRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.listeners.forEach(fn => fn([...this.notifications]));
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  getAll() {
    return [...this.notifications];
  }
}

export const notifyStore = new NotificationStore();

export function notifyPayment(domain: string, amount: number) {
  return notifyStore.push({
    type: "payment",
    title: "💰 新規決済が完了",
    body: `${domain} — ¥${amount.toLocaleString()} の収益が確定しました`,
  });
}

export function notifyBot(botName: string, url: string) {
  return notifyStore.push({
    type: "bot",
    title: `🤖 ${botName} を検知`,
    body: `${url} へのアクセスを検知・課金フローを開始しました`,
  });
}

export function notifyAlert(title: string, body: string) {
  return notifyStore.push({ type: "alert", title, body });
}

// ── メールプレビューサービス (Resend代替) ─────────────────────────────────────
export type EmailPreview = {
  to: string;
  subject: string;
  html: string;
  sentAt: Date;
};

type EmailListener = (emails: EmailPreview[]) => void;

class EmailPreviewStore {
  private emails: EmailPreview[] = [];
  private listeners: EmailListener[] = [];

  subscribe(fn: EmailListener) {
    this.listeners.push(fn);
    fn([...this.emails]);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  send(to: string, subject: string, html: string): EmailPreview {
    const email: EmailPreview = { to, subject, html, sentAt: new Date() };
    this.emails = [email, ...this.emails].slice(0, 20);
    this.listeners.forEach(fn => fn([...this.emails]));

    // 同時に通知も飛ばす
    notifyStore.push({
      type: "info",
      title: "📧 メール送信完了",
      body: `${to} へ「${subject}」を送信しました`,
    });

    return email;
  }

  getAll() { return [...this.emails]; }
  getLatest() { return this.emails[0] ?? null; }
}

export const emailStore = new EmailPreviewStore();

export function sendDiagnosisEmail(to: string, url: string, data: {
  ai_monthly: number;
  harmful_monthly: number;
  potential_revenue_jpy: number;
  recommendation: "A" | "B";
}): EmailPreview {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f0f0f;color:#fff;padding:32px;border-radius:12px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
        <span style="font-size:20px;">⚡</span>
        <span style="font-size:20px;font-weight:bold;color:#B89F5D;">Adctor</span>
      </div>
      <h1 style="font-size:22px;font-weight:bold;margin:0 0 8px;">AIクローラー診断レポート</h1>
      <p style="color:#888;font-size:14px;margin:0 0 24px;">診断URL: <strong style="color:#fff;">${url}</strong></p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
        <div style="background:#1a1a1a;border:1px solid #ffffff15;border-radius:10px;padding:16px;">
          <p style="color:#888;font-size:12px;margin:0 0 4px;">正規AIクロール</p>
          <p style="color:#B89F5D;font-size:24px;font-weight:bold;margin:0;">${data.ai_monthly.toLocaleString()}<span style="font-size:12px;color:#888;"> 件/月</span></p>
        </div>
        <div style="background:#1a1a1a;border:1px solid #ffffff15;border-radius:10px;padding:16px;">
          <p style="color:#888;font-size:12px;margin:0 0 4px;">収益化ポテンシャル</p>
          <p style="color:#B89F5D;font-size:24px;font-weight:bold;margin:0;">¥${data.potential_revenue_jpy.toLocaleString()}<span style="font-size:12px;color:#888;"> /月</span></p>
        </div>
      </div>

      <div style="background:${data.recommendation === 'B' ? '#B89F5D08' : '#00CCFF08'};border:1px solid ${data.recommendation === 'B' ? '#B89F5D30' : '#00CCFF30'};border-radius:10px;padding:16px;margin-bottom:24px;">
        <p style="color:${data.recommendation === 'B' ? '#B89F5D' : '#00CCFF'};font-size:12px;font-weight:bold;margin:0 0 4px;">推奨パッケージ</p>
        <p style="color:#fff;font-size:16px;font-weight:bold;margin:0 0 8px;">Package ${data.recommendation} — ${data.recommendation === 'B' ? 'Pay-per-Crawl 収益化' : 'GEO最適化 & 防衛'}</p>
        <p style="color:#888;font-size:13px;margin:0;">${data.recommendation === 'B' ? 'AIクロールを直接収益化する新しい収益源を構築します。' : 'AI検索からの流入・認知・リード獲得を最大化します。'}</p>
      </div>

      <a href="http://localhost:3000/lp#packages" style="display:inline-block;background:#B89F5D;color:#000;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;">詳細を見る →</a>
      <p style="color:#444;font-size:11px;margin-top:24px;">© 2026 Adctor by Regalis Japan Group</p>
    </div>
  `;
  return emailStore.send(to, `【Adctor】${url} の診断レポートが完成しました`, html);
}

// ── Bot 判定エンジン (IPinfo代替) ─────────────────────────────────────────────
export type BotInfo = {
  name: string;
  company: string;
  risk: "low" | "medium" | "high";
  color: string;
  monetizable: boolean;
};

const BOT_SIGNATURES: Array<{ pattern: RegExp } & BotInfo> = [
  { pattern: /GPTBot/i,               name: "GPTBot",        company: "OpenAI",       risk: "medium", color: "#B89F5D",  monetizable: true  },
  { pattern: /ChatGPT-User/i,         name: "ChatGPT-User",  company: "OpenAI",       risk: "low",    color: "#B89F5D",  monetizable: true  },
  { pattern: /ClaudeBot/i,            name: "ClaudeBot",     company: "Anthropic",    risk: "low",    color: "#00CCFF",  monetizable: true  },
  { pattern: /PerplexityBot/i,        name: "PerplexityBot", company: "Perplexity",   risk: "low",    color: "#FF6600",  monetizable: true  },
  { pattern: /Googlebot/i,            name: "Googlebot",     company: "Google",       risk: "low",    color: "#4285F4",  monetizable: false },
  { pattern: /AhrefsBot/i,            name: "AhrefsBot",     company: "Ahrefs",       risk: "high",   color: "#FF3333",  monetizable: false },
  { pattern: /SemrushBot/i,           name: "SemrushBot",    company: "Semrush",      risk: "high",   color: "#FF3333",  monetizable: false },
  { pattern: /DataForSeoBot/i,        name: "DataForSeoBot", company: "DataForSeo",   risk: "high",   color: "#FF3333",  monetizable: false },
];

export function detectBot(userAgent: string): BotInfo | null {
  for (const sig of BOT_SIGNATURES) {
    if (sig.pattern.test(userAgent)) {
      const { pattern, ...info } = sig;
      return info;
    }
  }
  return null;
}

export function generateMockCrawlers(seed: number = Date.now()) {
  const rng = (min: number, max: number) => {
    const x = Math.sin(seed++) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1) + min);
  };
  return [
    { name: "GPTBot",        company: "OpenAI",      risk: "medium" as const, monthly: rng(600, 1400), color: "#B89F5D",  monetizable: true  },
    { name: "ClaudeBot",     company: "Anthropic",   risk: "low"    as const, monthly: rng(300, 700),  color: "#00CCFF",  monetizable: true  },
    { name: "PerplexityBot", company: "Perplexity",  risk: "low"    as const, monthly: rng(100, 450),  color: "#FF6600",  monetizable: true  },
    { name: "AhrefsBot",     company: "Ahrefs",      risk: "high"   as const, monthly: rng(700, 1600), color: "#FF3333",  monetizable: false },
    { name: "SemrushBot",    company: "Semrush",      risk: "high"   as const, monthly: rng(400, 1100), color: "#FF3333",  monetizable: false },
  ];
}
