"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, DollarSign, Bot, AlertTriangle, Info } from "lucide-react";
import { notifyStore, type Notification } from "@/lib/adctor-services";

const ICONS: Record<Notification["type"], React.ReactNode> = {
  payment: <DollarSign className="w-3.5 h-3.5 text-[#B89F5D]" />,
  bot:     <Bot className="w-3.5 h-3.5 text-[#00CCFF]" />,
  alert:   <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  info:    <Info className="w-3.5 h-3.5 text-white/40" />,
};

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}秒前`;
  if (s < 3600) return `${Math.floor(s / 60)}分前`;
  return `${Math.floor(s / 3600)}時間前`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<Notification[]>([]);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const unsub = notifyStore.subscribe(setNotes);
    return unsub;
  }, []);

  // ドロップダウン位置をボタンの座標から動的計算（サイドバーによるクリップを回避）
  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPanelPos({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
    if (!open) notifyStore.markAllRead();
    setOpen(!open);
  };

  // 外側クリックで閉じる
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current && !btnRef.current.contains(target)) {
        const panel = document.getElementById("notif-panel");
        if (!panel || !panel.contains(target)) setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unread = notes.filter(n => !n.read).length;

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-label="通知"
      >
        <Bell className="w-4 h-4 text-white/50" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#B89F5D] rounded-full text-[10px] text-black font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* fixed ポジションで表示（サイドバーのクリップを回避） */}
      {open && (
        <div
          id="notif-panel"
          className="fixed w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden"
          style={{ top: panelPos.top, left: panelPos.left }}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-white/50" />
              <span className="text-xs font-semibold text-white">通知</span>
              {notes.length > 0 && (
                <span className="text-xs text-white/30">{notes.length}件</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => notifyStore.markAllRead()}
                className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />すべて既読
              </button>
              <button onClick={() => setOpen(false)}>
                <X className="w-3.5 h-3.5 text-white/30 hover:text-white/60 transition-colors" />
              </button>
            </div>
          </div>

          {/* 通知リスト */}
          <div className="max-h-[420px] overflow-y-auto">
            {notes.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/20">通知はありません</p>
              </div>
            ) : (
              notes.map(note => (
                <div
                  key={note.id}
                  className={`px-4 py-3 border-b border-white/5 hover:bg-white/[0.03] transition-colors ${
                    !note.read ? "bg-[#B89F5D]/[0.03]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {ICONS[note.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white leading-snug">{note.title}</p>
                      <p className="text-xs text-white/40 mt-0.5 leading-snug">{note.body}</p>
                      <p className="text-[10px] text-white/20 mt-1">{timeAgo(note.timestamp)}</p>
                    </div>
                    {!note.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B89F5D] flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
