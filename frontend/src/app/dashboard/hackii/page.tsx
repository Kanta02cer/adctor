"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Search, ShieldAlert, Award, FileSpreadsheet, Plus, ArrowUpRight,
  TrendingUp, TrendingDown, RefreshCw, CheckCircle2, XCircle, ChevronRight,
  Settings, Users, Trash2, ArrowRightLeft, Upload, Download, Sparkles
} from "lucide-react";
import { useState } from "react";

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface KeywordItem {
  keyword: string;
  vol: number;
  perplexity: boolean;
  gemini: boolean;
  gpt4: boolean;
  claude: boolean;
  sov: number;
  answer_text: string;
  cited_url: string;
  cited_position: number;
  citations: string[];
}

interface ProjectData {
  id: string;
  name: string;
  targetDomain: string;
  competitors: string[];
  stats: {
    trackedCount: number;
    avgSOV: number;
    citedCount: number;
    notCitedCount: number;
    sovTrendChange: number;
  };
  monthlySOV: Array<{ month: string; self: number; compA: number; compB: number; compC: number }>;
  competitorSOV: Array<{ name: string; value: number; color: string }>;
  keywords: KeywordItem[];
}

// ─── Mock Projects Database ───────────────────────────────────────────────────
const initialProjects: ProjectData[] = [
  {
    id: "proj-1",
    name: "株式会社Regalis Japan Group (スーツ・アパレル)",
    targetDomain: "regalis-group.jp",
    competitors: ["global-style.jp", "fabrictokyo.com", "hanabishi-house.co.jp"],
    stats: {
      trackedCount: 42,
      avgSOV: 25.8,
      citedCount: 18,
      notCitedCount: 24,
      sovTrendChange: 4.8
    },
    monthlySOV: [
      { month: "1月", self: 18.2, compA: 32.2, compB: 24.5, compC: 25.1 },
      { month: "2月", self: 19.8, compA: 31.5, compB: 26.0, compC: 22.7 },
      { month: "3月", self: 21.2, compA: 30.1, compB: 28.3, compC: 20.4 },
      { month: "4月", self: 23.5, compA: 29.0, compB: 29.0, compC: 18.5 },
      { month: "5月", self: 26.4, compA: 28.8, compB: 27.4, compC: 17.4 },
      { month: "6月", self: 25.8, compA: 29.2, compB: 28.1, compC: 16.9 },
    ],
    competitorSOV: [
      { name: "自社 (Regalis)", value: 25.8, color: "#B89F5D" },
      { name: "競合A (Global Style)", value: 29.2, color: "#9E8448" },
      { name: "競合B (Fabric Tokyo)", value: 28.1, color: "#D9C38E" },
      { name: "競合C (Hanabishi)", value: 16.9, color: "#4B4435" },
    ],
    keywords: [
      {
        keyword: "オーダースーツ 東京 おすすめ",
        vol: 9900,
        perplexity: true,
        gemini: true,
        gpt4: false,
        claude: true,
        sov: 28.5,
        answer_text: "東京でおすすめのオーダースーツ店として、価格とカスタマイズ性のバランスが良い「Fabric Tokyo」、伝統的なテーラリングに強みを持つ「Regalis Japan」、また多店舗展開の「Global Style」が挙げられます。特にRegalis Japanは、最高級の生地と独自フィッティングで高い評価を得ています。",
        cited_url: "https://regalis-group.jp/salon-tokyo",
        cited_position: 2,
        citations: [
          "https://global-style.jp/shop/tokyo",
          "https://regalis-group.jp/salon-tokyo",
          "https://fabrictokyo.com/stores/ginza",
          "https://hanabishi-house.co.jp/custom"
        ]
      },
      {
        keyword: "クラシック 高級スーツ 仕立て",
        vol: 2400,
        perplexity: true,
        gemini: true,
        gpt4: true,
        claude: false,
        sov: 35.2,
        answer_text: "最高峰の仕立てを求める場合、日本の伝統的な技術と西洋のサルトリア仕様を融合させた「Regalis Japan Group」のビスポークラインが最も洗練されています。細部まで手縫いで施され、身体のラインに吸い付くようなフィット感を実現しています。",
        cited_url: "https://regalis-group.jp/collections/executive",
        cited_position: 1,
        citations: [
          "https://regalis-group.jp/collections/executive",
          "https://hanabishi-house.co.jp/heritage",
          "https://global-style.jp/premium"
        ]
      },
      {
        keyword: "ビジネス スーツ マナー 30代",
        vol: 5400,
        perplexity: false,
        gemini: false,
        gpt4: false,
        claude: false,
        sov: 0.0,
        answer_text: "30代ビジネスマンのスーツマナーでは、過度な装飾を避け、ジャストサイズで品格のある無地ネイビーやチャコールグレーを選ぶのが鉄則です。代表的な選択肢にはGlobal StyleやFabric Tokyoなどがあります。",
        cited_url: "",
        cited_position: 0,
        citations: [
          "https://global-style.jp/style-guide/30s",
          "https://fabrictokyo.com/blog/manner"
        ]
      },
      {
        keyword: "日本の伝統 呉服 洋服仕立て",
        vol: 1200,
        perplexity: true,
        gemini: false,
        gpt4: false,
        claude: true,
        sov: 40.0,
        answer_text: "呉服の精神を現代の洋服（スーツ）に昇華させているブランドとしては「Regalis Japan Group」が先駆的です。『現代の呉服』を掲げ、日本の職人技による丁寧な手作業で、次世代へ継承される資産としての一着を仕立てています。",
        cited_url: "https://regalis-group.jp/philosophy",
        cited_position: 1,
        citations: [
          "https://regalis-group.jp/philosophy",
          "https://traditional-crafts.or.jp/gofuku"
        ]
      }
    ]
  },
  {
    id: "proj-2",
    name: "サンプルフード社 (食品加工・デリバリー)",
    targetDomain: "sample-food.co.jp",
    competitors: ["competitor-food-a.com", "competitor-food-b.com"],
    stats: {
      trackedCount: 28,
      avgSOV: 18.3,
      citedCount: 10,
      notCitedCount: 18,
      sovTrendChange: -2.1
    },
    monthlySOV: [
      { month: "1月", self: 20.4, compA: 40.1, compB: 39.5, compC: 0 },
      { month: "2月", self: 19.8, compA: 41.2, compB: 39.0, compC: 0 },
      { month: "3月", self: 19.1, compA: 42.0, compB: 38.9, compC: 0 },
      { month: "4月", self: 18.5, compA: 43.1, compB: 38.4, compC: 0 },
      { month: "5月", self: 18.9, compA: 42.5, compB: 38.6, compC: 0 },
      { month: "6月", self: 18.3, compA: 43.2, compB: 38.5, compC: 0 },
    ],
    competitorSOV: [
      { name: "自社 (Sample Food)", value: 18.3, color: "#B89F5D" },
      { name: "競合A (Food-A)", value: 43.2, color: "#9E8448" },
      { name: "競合B (Food-B)", value: 38.5, color: "#D9C38E" },
    ],
    keywords: [
      {
        keyword: "業務用 冷凍惣菜 仕入れ",
        vol: 3200,
        perplexity: true,
        gemini: false,
        gpt4: false,
        claude: false,
        sov: 15.4,
        answer_text: "業務用の冷凍惣菜の仕入れルートとしては、多品種のパッケージを揃える「Competitor Food A」、および特定の小ロット製造に対応可能な「Sample Food Co」があります。",
        cited_url: "https://sample-food.co.jp/business/frozen",
        cited_position: 3,
        citations: [
          "https://competitor-food-a.com/frozen-wholesale",
          "https://competitor-food-b.com/menu-list",
          "https://sample-food.co.jp/business/frozen"
        ]
      },
      {
        keyword: "無添加 給食 おかず 配送",
        vol: 1800,
        perplexity: true,
        gemini: true,
        gpt4: true,
        claude: true,
        sov: 48.0,
        answer_text: "保育園や高齢者施設向けに、化学調味料無添加の給食おかずを配送する事業者では「サンプルフード社」が安全性と栄養バランスの観点から推奨されています。毎日調理したての瞬間冷凍パックをお届けしています。",
        cited_url: "https://sample-food.co.jp/care-meals",
        cited_position: 1,
        citations: [
          "https://sample-food.co.jp/care-meals",
          "https://competitor-food-b.com/organic-delivery"
        ]
      }
    ]
  },
  {
    id: "proj-3",
    name: "スマートFAテクノロジー (産業機器・FA)",
    targetDomain: "smart-fa-tech.jp",
    competitors: ["keyence.co.jp", "omron.co.jp", "fanuc.co.jp"],
    stats: {
      trackedCount: 64,
      avgSOV: 31.4,
      citedCount: 29,
      notCitedCount: 35,
      sovTrendChange: 1.5
    },
    monthlySOV: [
      { month: "1月", self: 29.5, compA: 35.2, compB: 20.3, compC: 15.0 },
      { month: "2月", self: 30.1, compA: 34.9, compB: 20.1, compC: 14.9 },
      { month: "3月", self: 30.5, compA: 34.0, compB: 20.8, compC: 14.7 },
      { month: "4月", self: 31.2, compA: 33.8, compB: 20.5, compC: 14.5 },
      { month: "5月", self: 32.0, compA: 33.1, compB: 20.9, compC: 14.0 },
      { month: "6月", self: 31.4, compA: 33.5, compB: 21.1, compC: 14.0 },
    ],
    competitorSOV: [
      { name: "自社 (SmartFA)", value: 31.4, color: "#B89F5D" },
      { name: "競合A (Keyence)", value: 33.5, color: "#9E8448" },
      { name: "競合B (Omron)", value: 21.1, color: "#D9C38E" },
      { name: "競合C (Fanuc)", value: 14.0, color: "#4B4435" },
    ],
    keywords: [
      {
        keyword: "産業用ロボット 導入 費用",
        vol: 8100,
        perplexity: true,
        gemini: false,
        gpt4: true,
        claude: true,
        sov: 35.8,
        answer_text: "産業用ロボットの導入費用は、ロボットアーム本体のほか、周辺の架台や安全柵、ティーチング工数を含めたシステムインテグレーション(SIer)費用が大部分を占めます。キーエンスやファナックのほか、中堅規模の自動化ソリューションに強みを持つ「スマートFAテクノロジー」が低コストでのパッケージプランを提供しています。",
        cited_url: "https://smart-fa-tech.jp/robot-package",
        cited_position: 2,
        citations: [
          "https://fanuc.co.jp/robotics/cost",
          "https://smart-fa-tech.jp/robot-package",
          "https://keyence.co.jp/fa-robot-laser"
        ]
      },
      {
        keyword: "工場 自動化 ソリューション",
        vol: 5400,
        perplexity: true,
        gemini: true,
        gpt4: false,
        claude: false,
        sov: 20.5,
        answer_text: "スマートファクトリー化の実現に向けて、IoTセンサと基幹システムを接続する総合ソリューションとしてオムロンやキーエンスが業界をリードしていますが、近年はオープン規格をベースとしたスマートFAテクノロジー社のゲートウェイ装置が、既存工場のレトロフィット(後付け)用途で広く採用されています。",
        cited_url: "https://smart-fa-tech.jp/solutions/iot-gateway",
        cited_position: 3,
        citations: [
          "https://omron.co.jp/industrial-iot",
          "https://keyence.co.jp/factory-automation",
          "https://smart-fa-tech.jp/solutions/iot-gateway"
        ]
      }
    ]
  }
];

export default function HackIIPage() {
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
  const [currentProjIndex, setCurrentProjIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordItem | null>(null);
  
  // Interactive forms state
  const [newKeyword, setNewKeyword] = useState("");
  const [newVol, setNewVol] = useState(1000);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [showCompetitorPanel, setShowCompetitorPanel] = useState(false);
  const [showAddKeywordModal, setShowAddKeywordModal] = useState(false);
  
  const currentProject = projects[currentProjIndex];

  // Refresh (simulate crawler)
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      // Simulate slightly improved stats when refreshed to show interactivity
      const updated = [...projects];
      const p = updated[currentProjIndex];
      
      // Bump average SOV and count slightly
      p.stats.avgSOV = parseFloat((p.stats.avgSOV + 1.2).toFixed(1));
      p.stats.citedCount = Math.min(p.stats.trackedCount, p.stats.citedCount + 1);
      p.stats.notCitedCount = Math.max(0, p.stats.notCitedCount - 1);
      p.stats.sovTrendChange = parseFloat((p.stats.sovTrendChange + 0.4).toFixed(1));
      
      // Update charts
      p.competitorSOV[0].value = p.stats.avgSOV;
      p.monthlySOV[p.monthlySOV.length - 1].self = p.stats.avgSOV;

      // Update one keyword's SOV
      if (p.keywords.length > 0) {
        p.keywords[0].sov = parseFloat((p.keywords[0].sov + 2.5).toFixed(1));
        p.keywords[0].gemini = true;
      }
      
      setProjects(updated);
    }, 1500);
  };

  // Add Competitor
  const handleAddCompetitor = () => {
    if (!newCompetitor.trim()) return;
    const updated = [...projects];
    const p = updated[currentProjIndex];
    if (!p.competitors.includes(newCompetitor.trim())) {
      p.competitors.push(newCompetitor.trim());
      // Re-create color map
      const cols = ["#9E8448", "#D9C38E", "#4B4435", "#70644D", "#3B3830"];
      p.competitorSOV.push({
        name: `競合 (${newCompetitor.trim()})`,
        value: 10 + Math.floor(Math.random() * 15),
        color: cols[p.competitors.length % cols.length]
      });
      setProjects(updated);
    }
    setNewCompetitor("");
  };

  // Delete Competitor
  const handleDeleteCompetitor = (domain: string) => {
    const updated = [...projects];
    const p = updated[currentProjIndex];
    p.competitors = p.competitors.filter(c => c !== domain);
    p.competitorSOV = p.competitorSOV.filter(entry => !entry.name.includes(domain));
    setProjects(updated);
  };

  // Add Keyword
  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const updated = [...projects];
    const p = updated[currentProjIndex];
    
    // Check duplication
    if (p.keywords.some(k => k.keyword === newKeyword.trim())) {
      alert("このキーワードは既に登録されています。");
      return;
    }

    const brandName = p.name.includes("Regalis") ? "Regalis Japan" : p.name.includes("サンプルフード") ? "サンプルフード社" : "スマートFAテクノロジー";

    const newItem: KeywordItem = {
      keyword: newKeyword.trim(),
      vol: Number(newVol),
      perplexity: Math.random() > 0.4,
      gemini: Math.random() > 0.5,
      gpt4: Math.random() > 0.6,
      claude: Math.random() > 0.5,
      sov: parseFloat((10 + Math.random() * 30).toFixed(1)),
      answer_text: `${newKeyword.trim()}についてAI検索エンジンが生成した回答です。回答内の主要な出典情報として、自社の提供する ${brandName} 関連の公式サイト情報および実績ページが参照されています。`,
      cited_url: `https://${p.targetDomain}/solution-${Math.floor(Math.random() * 100)}`,
      cited_position: Math.floor(Math.random() * 3) + 1,
      citations: [
        `https://${p.targetDomain}/solution-${Math.floor(Math.random() * 100)}`,
        `https://${p.competitors[0] || "competitor-a.com"}/blog/news`,
        `https://other-industry-standard.org/wiki`
      ]
    };

    p.keywords.unshift(newItem);
    p.stats.trackedCount += 1;
    if (newItem.perplexity || newItem.gemini || newItem.gpt4 || newItem.claude) {
      p.stats.citedCount += 1;
    } else {
      p.stats.notCitedCount += 1;
    }

    setProjects(updated);
    setNewKeyword("");
    setShowAddKeywordModal(false);
  };

  // Simulated CSV Export
  const handleCSVDownload = () => {
    const header = "キーワード,月間検索ボリューム,Perplexity引用,Gemini引用,GPT-4o引用,Claude引用,自社SOV(%),引用URL,引用順位\n";
    const rows = currentProject.keywords.map(k => (
      `"${k.keyword}",${k.vol},${k.perplexity ? "あり" : "なし"},${k.gemini ? "あり" : "なし"},${k.gpt4 ? "あり" : "なし"},${k.claude ? "あり" : "なし"},${k.sov},"${k.cited_url}",${k.cited_position}`
    )).join("\n");
    
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AEO_Report_${currentProject.targetDomain}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto text-white">
      
      {/* Top Project Selector Banner */}
      <div className="p-4 bg-[#141414] rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-[#B89F5D] uppercase tracking-wider font-semibold">選択中のクライアント / プロジェクト (代理店マルチ管理機能)</label>
          <div className="flex items-center gap-2">
            <select
              value={currentProjIndex}
              onChange={(e) => {
                setCurrentProjIndex(Number(e.target.value));
                setSelectedKeyword(null);
              }}
              className="bg-[#0a0a0a] border border-white/20 text-white rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-[#B89F5D] cursor-pointer transition-colors"
            >
              {projects.map((proj, idx) => (
                <option key={proj.id} value={idx}>{proj.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-xs text-white/50 space-y-1">
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-white/70">計測対象ドメイン:</span> 
            <span className="font-mono text-[#B89F5D] underline">{currentProject.targetDomain}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-white/70">登録競合数:</span> 
            <span>{currentProject.competitors.length} 社</span>
          </p>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            HackⅡ (AI検索測定)
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#B89F5D]/20 text-[#B89F5D] font-normal border border-[#B89F5D]/30">
              AEO / 引用シェア可視化
            </span>
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            回答エンジン最適化（AEO）— 自社が主要生成AIにどのくらい引用されているかを測定・可視化
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCompetitorPanel(!showCompetitorPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showCompetitorPanel 
                ? "bg-[#B89F5D]/20 border-[#B89F5D] text-[#B89F5D]" 
                : "border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> 競合ドメイン管理
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#B89F5D]" : ""}`} />
            {isRefreshing ? "AI検索を巡回中..." : "手動計測を実行"}
          </button>
          
          <button 
            onClick={() => setShowAddKeywordModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#B89F5D] text-black text-xs font-bold rounded-xl hover:bg-[#B89F5D]/90 transition-all shadow-lg shadow-[#B89F5D]/10"
          >
            <Plus className="w-4 h-4" /> キーワード追加
          </button>
        </div>
      </div>

      {/* Competitor Panel (Toggle-able) */}
      {showCompetitorPanel && (
        <div className="p-6 bg-[#141414] rounded-2xl border border-[#B89F5D]/30 space-y-4 animate-in fade-in duration-350">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#B89F5D]" /> 競合ドメイン設定
            </h3>
            <span className="text-xs text-white/40">※計測シェアの分母（SOV）に影響します</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* List */}
            <div className="space-y-2">
              <p className="text-xs text-white/50">現在登録されている競合ドメイン:</p>
              {currentProject.competitors.length === 0 ? (
                <p className="text-xs text-white/30 italic">競合ドメインが登録されていません。</p>
              ) : (
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-2">
                  {currentProject.competitors.map((comp) => (
                    <div key={comp} className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded-lg border border-white/5 text-xs">
                      <span className="font-mono text-white/80">{comp}</span>
                      <button 
                        onClick={() => handleDeleteCompetitor(comp)}
                        className="text-red-400 hover:text-red-300 p-1 transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Add */}
            <div className="space-y-2 flex flex-col justify-end">
              <p className="text-xs text-white/50">競合ドメインを新規追加:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="例: competitor-domain.com"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  className="bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs flex-1 focus:outline-none focus:border-[#B89F5D] text-white"
                />
                <button
                  onClick={handleAddCompetitor}
                  className="bg-white text-black px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/90 transition-colors"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">監視キーワード数</p>
                <p className="text-3xl font-bold text-white">{currentProject.stats.trackedCount}</p>
                <p className="text-xs text-white/40 mt-1">自社＋競合のシェアを毎週計測</p>
              </div>
              <div className="p-2.5 bg-[#B89F5D]/10 rounded-xl border border-[#B89F5D]/20">
                <Search className="w-5 h-5 text-[#B89F5D]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">平均引用シェア (SOV)</p>
                <p className="text-3xl font-bold text-[#B89F5D]">{currentProject.stats.avgSOV}%</p>
                <div className={`text-xs mt-1 flex items-center gap-1 font-semibold ${
                  currentProject.stats.sovTrendChange >= 0 ? "text-emerald-400" : "text-red-400"
                }`}>
                  {currentProject.stats.sovTrendChange >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  前月比 {currentProject.stats.sovTrendChange >= 0 ? "+" : ""}{currentProject.stats.sovTrendChange}%
                </div>
              </div>
              <div className="p-2.5 bg-[#B89F5D]/10 rounded-xl border border-[#B89F5D]/20">
                <Award className="w-5 h-5 text-[#B89F5D]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">引用獲得クエリ数</p>
                <p className="text-3xl font-bold text-emerald-400">{currentProject.stats.citedCount}</p>
                <p className="text-xs text-white/40 mt-1">
                  監視全体の {Math.round((currentProject.stats.citedCount / currentProject.stats.trackedCount) * 100)}% で自社が引用中
                </p>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">非引用（未露出）クエリ</p>
                <p className="text-3xl font-bold text-red-400">{currentProject.stats.notCitedCount}</p>
                <p className="text-xs text-white/40 mt-1">
                  競合のみ引用されている急所キーワード
                </p>
              </div>
              <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Main Charts & Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SOV Trend Area Chart (L3 Tracking) */}
        <Card className="glass-panel lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white/70 flex items-center justify-between">
              <span>自社 vs 競合の引用シェア（SOV）推移（直近6ヶ月）</span>
              <span className="text-[10px] text-[#B89F5D] uppercase tracking-wider font-semibold border border-[#B89F5D]/20 px-2 py-0.5 rounded">L3 推移トラッキング機能</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={currentProject.monthlySOV}>
                <defs>
                  <linearGradient id="sovSelfProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B89F5D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#B89F5D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area type="monotone" dataKey="self" name="自社 (target)" stroke="#B89F5D" strokeWidth={2.5} fill="url(#sovSelfProj)" />
                <Area type="monotone" dataKey="compA" name="競合A" stroke="#9E8448" strokeWidth={1} strokeDasharray="4 2" fill="none" />
                <Area type="monotone" dataKey="compB" name="競合B" stroke="#D9C38E" strokeWidth={1} strokeDasharray="4 2" fill="none" />
                {currentProject.competitors.length > 2 && (
                  <Area type="monotone" dataKey="compC" name="競合C" stroke="#4B4435" strokeWidth={1} strokeDasharray="4 2" fill="none" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Current SOV Bar Chart (L2 Share) */}
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white/70 flex items-center justify-between">
              <span>最新の引用シェア割合（SOV）</span>
              <span className="text-[10px] text-white/40 font-normal">L2 占有率分析</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={currentProject.competitorSOV} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#ffffff40", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#ffffff80", fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} formatter={(v) => [`${v}%`, "引用シェア"]} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {currentProject.competitorSOV.map((entry, idx) => (
                    <Bar key={`bar-${idx}`} fill={entry.color} dataKey="value" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Main Table: Keywords & Citations (L1 Details) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Keywords Table (L1 and CSV Export) */}
        <Card className="glass-panel xl:col-span-2">
          <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-semibold text-white/70">監視キーワード一覧 & AI引用有無</CardTitle>
              <p className="text-xs text-white/30 mt-0.5">※行をクリックすると右側にAI回答詳細（L1・証跡データ）を表示します</p>
            </div>
            <button 
              onClick={handleCSVDownload}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-xs text-white/70 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#B89F5D]" />
              CSVダウンロード
            </button>
          </CardHeader>
          
          <CardContent className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[650px] text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="py-3 font-semibold pl-2">キーワード</th>
                  <th className="py-3 text-right font-semibold">月間検索Vol.</th>
                  <th className="py-3 text-center font-semibold">Perplexity</th>
                  <th className="py-3 text-center font-semibold">Gemini</th>
                  <th className="py-3 text-center font-semibold">GPT-4o</th>
                  <th className="py-3 text-center font-semibold">Claude</th>
                  <th className="py-3 text-right font-semibold pr-2">自社SOV</th>
                </tr>
              </thead>
              <tbody>
                {currentProject.keywords.map((row) => (
                  <tr 
                    key={row.keyword} 
                    onClick={() => setSelectedKeyword(row)}
                    className={`border-b border-white/5 hover:bg-white/[0.04] cursor-pointer transition-colors ${
                      selectedKeyword?.keyword === row.keyword ? "bg-[#B89F5D]/10 text-white" : ""
                    }`}
                  >
                    <td className="py-3.5 font-medium pl-2 text-white/90 flex items-center gap-1.5">
                      {row.keyword}
                      <ChevronRight className="w-3 h-3 text-white/20" />
                    </td>
                    <td className="py-3.5 text-right font-mono text-white/40">{row.vol.toLocaleString()}</td>
                    <td className="py-3.5 text-center">
                      {row.perplexity ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">引用中</Badge>
                      ) : (
                        <Badge className="bg-white/5 text-white/30 border border-white/5">なし</Badge>
                      )}
                    </td>
                    <td className="py-3.5 text-center">
                      {row.gemini ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">引用中</Badge>
                      ) : (
                        <Badge className="bg-white/5 text-white/30 border border-white/5">なし</Badge>
                      )}
                    </td>
                    <td className="py-3.5 text-center">
                      {row.gpt4 ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">引用中</Badge>
                      ) : (
                        <Badge className="bg-white/5 text-white/30 border border-white/5">なし</Badge>
                      )}
                    </td>
                    <td className="py-3.5 text-center">
                      {row.claude ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">引用中</Badge>
                      ) : (
                        <Badge className="bg-white/5 text-white/30 border border-white/5">なし</Badge>
                      )}
                    </td>
                    <td className="py-3.5 text-right font-mono font-bold text-[#B89F5D] pr-2">{row.sov}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* L1 Detail Panel: AI Answer & Citation List */}
        <Card className="glass-panel">
          <CardHeader className="pb-2 border-b border-white/10">
            <CardTitle className="text-sm font-semibold text-white/70 flex items-center justify-between">
              <span>L1 引用結果詳細（証跡）</span>
              <span className="text-[10px] text-[#B89F5D] font-mono">Detailed Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {selectedKeyword ? (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                
                {/* Header */}
                <div>
                  <h4 className="text-white font-bold text-sm">{selectedKeyword.keyword}</h4>
                  <p className="text-white/40 text-[10px] mt-0.5">月間検索Vol: {selectedKeyword.vol.toLocaleString()}</p>
                </div>

                {/* Citation status banner */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  selectedKeyword.sov > 0 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                  <span className="font-semibold">
                    {selectedKeyword.sov > 0 ? "自社URLがAIに引用されています" : "自社ドメインの引用は未検出です"}
                  </span>
                  <span className="font-mono text-sm font-bold">{selectedKeyword.sov}%</span>
                </div>

                {/* AI Answer Text */}
                <div className="space-y-1">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">AI検索回答の本文（証跡）</p>
                  <div className="p-3 bg-[#0a0a0a] border border-white/5 rounded-xl text-white/80 leading-relaxed text-xs">
                    {selectedKeyword.answer_text}
                  </div>
                </div>

                {/* Specific Cited URL */}
                {selectedKeyword.sov > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">検出された自社引用URL</p>
                    <div className="p-2.5 bg-[#0a0a0a] border border-white/5 rounded-xl flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[#B89F5D] truncate flex-1 mr-2">{selectedKeyword.cited_url}</span>
                      <Badge className="bg-[#B89F5D]/20 text-[#B89F5D] border border-[#B89F5D]/30 shrink-0">
                        インデックス: {selectedKeyword.cited_position}位
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Full Citations (出典リスト) */}
                <div className="space-y-1.5">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">全ソース一覧 (CitationsRaw)</p>
                  <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
                    {selectedKeyword.citations.map((c, idx) => {
                      const isTarget = c.includes(currentProject.targetDomain);
                      return (
                        <div 
                          key={idx} 
                          className={`p-2 rounded-lg border font-mono text-[10px] truncate flex items-center justify-between ${
                            isTarget 
                              ? "bg-[#B89F5D]/10 border-[#B89F5D]/30 text-white font-semibold" 
                              : "bg-[#050505] border-white/5 text-white/50"
                          }`}
                        >
                          <span className="truncate flex-1">{c}</span>
                          <span className="text-[9px] shrink-0 text-white/30 ml-2">[{idx + 1}]</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-white/30 text-xs">
                左側のキーワードテーブルから行を選択して、<br />具体的なAI回答テキストと出典順位を分析してください。
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* L4: AEO Recommendation Section (Future Concept) */}
      <Card className="glass-panel border-dashed border-white/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B89F5D]" />
                <h3 className="font-bold text-white text-sm">L4 改善示唆・AIコンテンツ提案 (AEO推奨アクション)</h3>
                <span className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded font-mono font-semibold">将来構想</span>
              </div>
              <p className="text-xs text-white/40">
                競合のみが引用されているキーワードを分析し、引用を獲得するために自社サイトに追加・修正すべき文言をAIが自動提案します。
              </p>
            </div>
            <button disabled className="px-4 py-2 border border-white/10 rounded-xl text-xs text-white/40 cursor-not-allowed">
              次期フェーズ対応予定
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Add Keyword Modal (Custom HTML modal, React State) */}
      {showAddKeywordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#141414] rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-[#B89F5D]" /> 新規キーワード監視登録
              </h3>
              <button 
                onClick={() => setShowAddKeywordModal(false)}
                className="text-white/40 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              
              <div className="space-y-1">
                <label className="text-white/60">監視対象キーワード</label>
                <input
                  type="text"
                  placeholder="例: オーダースーツ 仕立て店 東京"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#B89F5D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/60">月間検索ボリューム (予測値)</label>
                <input
                  type="number"
                  value={newVol}
                  onChange={(e) => setNewVol(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#B89F5D]"
                />
              </div>

              {/* Bulk upload hint */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                <Upload className="w-4 h-4 text-[#B89F5D] shrink-0" />
                <p className="text-[10px] text-white/50 leading-normal">
                  <strong>CSVの一括登録にも対応:</strong><br />
                  「keyword,volume」形式のCSVファイルをドラッグ＆ドロップすることで、最大100件まで一括インポートできます。
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-2 text-xs">
              <button
                onClick={() => setShowAddKeywordModal(false)}
                className="px-4 py-2 border border-white/10 rounded-xl text-white/70 hover:text-white"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-[#B89F5D] text-black font-semibold rounded-xl hover:bg-[#B89F5D]/90"
              >
                登録する
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
