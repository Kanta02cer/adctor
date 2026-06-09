"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Globe, Settings, Zap, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notification-bell";
import { useEffect, useState } from "react";
import { notifyBot, notifyPayment } from "@/lib/adctor-services";

const nav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "概要" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "分析" },
  { href: "/dashboard/sites", icon: Globe, label: "サイト管理" },
  { href: "/dashboard/settings", icon: Settings, label: "設定" },
];

// デモ用: 開始時に初期通知を追加し、その後ランダムに追加する
const DEMO_BOTS = ["GPTBot", "ClaudeBot", "PerplexityBot"];
const DEMO_URLS = ["/blog/ai-future", "/research/data-law", "/tech/llm-comparison", "/product/enterprise"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // デモ用: 開始時に初期通知を追加し、その後ランダムに追加する
  useEffect(() => {
    // 起動通知
    notifyPayment("techblog.example.co.jp", 800);
    notifyBot("GPTBot", "/blog/ai-future-2025");

    // 15〜45秒ごとにランダムな通知を生成
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.5) {
        const bot = DEMO_BOTS[Math.floor(Math.random() * DEMO_BOTS.length)];
        const url = DEMO_URLS[Math.floor(Math.random() * DEMO_URLS.length)];
        notifyBot(bot, url);
      } else {
        const amount = [800, 800, 1600, 2400][Math.floor(Math.random() * 4)];
        notifyPayment("example.co.jp", amount);
      }
    }, 15000 + Math.random() * 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden relative">
      {/* Mobile Top Navbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/70"
            aria-label="メニューを開く"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-[#B89F5D]" />
            <span className="font-bold text-sm">Adctor</span>
          </div>
        </div>
        <NotificationBell />
      </header>

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-[#B89F5D]" />
              <span className="text-xl font-bold text-white">Adctor</span>
            </div>
            <p className="text-xs text-white/40 mt-1">AI収益化プラットフォーム</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="hidden md:block">
              <NotificationBell />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                pathname === href
                  ? "bg-[#B89F5D]/10 text-[#B89F5D] font-medium"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-[#B89F5D]/20 flex items-center justify-center text-[#B89F5D] text-xs font-bold flex-shrink-0">
              K
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">井上幹太</p>
              <p className="text-xs text-white/40 truncate">Regalis Japan</p>
            </div>
            <LogOut className="w-4 h-4 text-white/30 flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
