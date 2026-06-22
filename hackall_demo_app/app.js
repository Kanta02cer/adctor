const DEMO_EMAIL = "agency@hackall.jp";
const DEMO_PASSWORD = "demo2026";

const state = {
  loggedIn: false,
  activeView: "overview",
  activeReport: "executive",
  liveMode: false,
  liveTickCount: 0,
  liveSince: null,
  lastLiveEvent: "待機中",
  clients: [
    { id: "c-001", name: "Regalis Japan Group", domain: "regalis-group.jp", plan: "Standard", fee: 100000, sov: 25.8, status: "提案中", keywords: 42, apiCost: 9200 },
    { id: "c-002", name: "Sample Food Co.", domain: "sample-food.co.jp", plan: "Standard", fee: 100000, sov: 18.3, status: "初回測定済", keywords: 28, apiCost: 6800 },
    { id: "c-003", name: "Smart FA Tech", domain: "smart-fa-tech.jp", plan: "Standard", fee: 100000, sov: 31.4, status: "月次運用", keywords: 64, apiCost: 12400 },
  ],
  keywords: [
    { keyword: "オーダースーツ 東京 おすすめ", client: "Regalis Japan Group", vol: 9900, engine: "Perplexity", cited: true, url: "https://regalis-group.jp/salon-tokyo", position: 2, sov: 28.5 },
    { keyword: "クラシック 高級スーツ 仕立て", client: "Regalis Japan Group", vol: 2400, engine: "Perplexity", cited: true, url: "https://regalis-group.jp/collections/executive", position: 1, sov: 35.2 },
    { keyword: "ビジネス スーツ マナー 30代", client: "Regalis Japan Group", vol: 5400, engine: "Perplexity", cited: false, url: "", position: 0, sov: 0 },
    { keyword: "業務用 冷凍惣菜 仕入れ", client: "Sample Food Co.", vol: 3200, engine: "Perplexity", cited: true, url: "https://sample-food.co.jp/business/frozen", position: 3, sov: 15.4 },
  ],
  crawlerEvents: [
    { operator: "OpenAI", crawler: "GPTBot", category: "Training", host: "regalis-group.jp", path: "/collections/executive", pattern: "/collections/*", status: 200, requests: 8420, bytes: 3.2, verified: true, robots: "allowed", referrer: "-", risk: "medium", policy: "allow_search_block_training" },
    { operator: "OpenAI", crawler: "ChatGPT-User", category: "User Agent", host: "regalis-group.jp", path: "/salon-tokyo", pattern: "/salon-*", status: 200, requests: 3280, bytes: 1.1, verified: true, robots: "allowed", referrer: "chatgpt.com", risk: "low", policy: "allow" },
    { operator: "Anthropic", crawler: "ClaudeBot", category: "Training", host: "sample-food.co.jp", path: "/care-meals", pattern: "/care-*", status: 403, requests: 5140, bytes: 0.4, verified: true, robots: "violated", referrer: "-", risk: "high", policy: "block_training" },
    { operator: "Perplexity", crawler: "PerplexityBot", category: "Search", host: "smart-fa-tech.jp", path: "/solutions/iot-gateway", pattern: "/solutions/*", status: 200, requests: 2780, bytes: 0.9, verified: true, robots: "allowed", referrer: "perplexity.ai", risk: "low", policy: "allow_search" },
    { operator: "ByteDance", crawler: "Bytespider", category: "Training", host: "regalis-group.jp", path: "/blog/style-guide", pattern: "/blog/*", status: 402, requests: 1890, bytes: 0.2, verified: false, robots: "blocked", referrer: "-", risk: "high", policy: "pay_or_block" },
    { operator: "Unknown", crawler: "AI-Scraper/1.2", category: "Unknown", host: "sample-food.co.jp", path: "/api/menu", pattern: "/api/*", status: 403, requests: 740, bytes: 0.1, verified: false, robots: "blocked", referrer: "-", risk: "high", policy: "block" },
  ],
  ppcRules: [
    { path: "/collections/*", price: 8, mode: "Exact price", action: "402 when training", monthly: 8420, acceptRate: 0.08, reason: "高単価商品ページ" },
    { path: "/blog/*", price: 4, mode: "Max price", action: "Pay or block", monthly: 1890, acceptRate: 0.03, reason: "記事資産の大量取得" },
    { path: "/solutions/*", price: 6, mode: "Allow search", action: "Free for search / paid for training", monthly: 2780, acceptRate: 0.06, reason: "B2B技術資料" },
    { path: "/api/*", price: 12, mode: "Block by default", action: "Manual approval", monthly: 740, acceptRate: 0.01, reason: "DB的価値が高い" },
  ],
  ppcEvents: [
    { time: "10:12", crawler: "Bytespider", path: "/blog/style-guide", accesses: 480, price: 4, max: 3, passRate: 0, chargeAmount: 1920, passedAmount: 0, status: "rejected", chargeState: "rejected", reason: "max price below rule" },
    { time: "10:08", crawler: "GPTBot", path: "/collections/executive", accesses: 320, price: 8, max: 10, passRate: 0.62, chargeAmount: 2560, passedAmount: 1587, status: "candidate", chargeState: "passed", reason: "payment intent detected" },
    { time: "09:57", crawler: "AI-Scraper/1.2", path: "/api/menu", accesses: 120, price: 12, max: 0, passRate: 0, chargeAmount: 1440, passedAmount: 0, status: "blocked", chargeState: "blocked", reason: "unverified crawler" },
    { time: "09:42", crawler: "PerplexityBot", path: "/solutions/iot-gateway", accesses: 260, price: 6, max: 0, passRate: 0, chargeAmount: 0, passedAmount: 0, status: "allowed", chargeState: "free_allowed", reason: "search referral allowed" },
    { time: "09:31", crawler: "ClaudeBot", path: "/whitepaper/robot-cost", accesses: 180, price: 12, max: 15, passRate: 0, chargeAmount: 2160, passedAmount: 0, status: "candidate", chargeState: "sent", reason: "402 sent / awaiting settlement" },
  ],
  invoices: [
    { id: "INV-2026-001", client: "代理店 Standard 月額", amount: 300000, status: "入金確認済" },
    { id: "INV-2026-002", client: "初期設定費", amount: 500000, status: "請求書発行済" },
  ],
  events: [
    "09:42 Perplexity citationsを保存しました",
    "09:41 Regalis Japan GroupのSOVが+2.4pt",
    "09:40 代理店粗利シミュレーションを更新",
    "09:38 402イベントをPPC Showroomへ追加",
  ],
  checklist: {
    agency: true,
    contract: true,
    client: true,
    keywords: false,
    firstRun: false,
    report: false,
  },
};

const navItems = [
  ["overview", "ダッシュボード"],
  ["clients", "クライアント管理"],
  ["measure", "AI検索計測"],
  ["crawler", "AIクローラー検知"],
  ["ppc", "PPC設計"],
  ["reports", "レポート"],
  ["billing", "請求・プラン"],
  ["setup", "導入設定"],
];

const loginScreen = document.querySelector("#loginScreen");
const appShell = document.querySelector("#appShell");
const viewRoot = document.querySelector("#viewRoot");
const viewTitle = document.querySelector("#viewTitle");
const toast = document.querySelector("#toast");
let liveTimer = null;

document.querySelector("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  attemptLogin();
});
document.querySelector("#demoLoginButton").addEventListener("click", () => {
  document.querySelector("#emailInput").value = DEMO_EMAIL;
  document.querySelector("#passwordInput").value = DEMO_PASSWORD;
  attemptLogin();
});
document.querySelector("#logoutButton").addEventListener("click", () => {
  stopLiveMode();
  state.loggedIn = false;
  appShell.classList.add("hidden");
  loginScreen.classList.remove("hidden");
});
document.querySelector("#runMeasureButton").addEventListener("click", runDemoMeasure);
document.querySelector("#downloadCsvButton").addEventListener("click", downloadCsv);
document.querySelector("#toggleLiveButton").addEventListener("click", toggleLiveMode);

function attemptLogin() {
  const email = document.querySelector("#emailInput").value.trim();
  const password = document.querySelector("#passwordInput").value.trim();
  const error = document.querySelector("#loginError");
  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    error.textContent = "営業デモ用アカウントでログインしてください。";
    return;
  }
  error.textContent = "";
  state.loggedIn = true;
  loginScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
  renderNav();
  render();
  updateLiveButton();
  showToast("デモ環境にログインしました。");
}

function renderNav() {
  const nav = document.querySelector("#navList");
  nav.innerHTML = navItems.map(([id, label]) => `
    <button class="nav-button ${state.activeView === id ? "active" : ""}" data-view="${id}">${label}</button>
  `).join("");
  nav.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.view;
      renderNav();
      render();
    });
  });
}

function render() {
  const label = navItems.find(([id]) => id === state.activeView)?.[1] || "ダッシュボード";
  viewTitle.textContent = label;
  const views = {
    overview: renderOverview,
    clients: renderClients,
    measure: renderMeasure,
    crawler: renderCrawlerDetection,
    ppc: renderPPC,
    reports: renderReports,
    billing: renderBilling,
    setup: renderSetup,
  };
  viewRoot.innerHTML = views[state.activeView]();
  bindViewEvents();
  updateLiveButton();
}

function agencyMetrics() {
  const agencyFee = 300000;
  const clientRevenue = state.clients.reduce((sum, client) => sum + client.fee, 0);
  const apiCost = state.clients.reduce((sum, client) => sum + client.apiCost, 0);
  const grossProfit = clientRevenue - agencyFee - apiCost;
  const avgSov = state.clients.reduce((sum, client) => sum + client.sov, 0) / state.clients.length;
  return { agencyFee, clientRevenue, apiCost, grossProfit, avgSov };
}

function crawlerMetrics() {
  const totalRequests = state.crawlerEvents.reduce((sum, item) => sum + item.requests, 0);
  const blockedRequests = state.crawlerEvents.filter((item) => [402, 403].includes(item.status)).reduce((sum, item) => sum + item.requests, 0);
  const verifiedRequests = state.crawlerEvents.filter((item) => item.verified).reduce((sum, item) => sum + item.requests, 0);
  const bytes = state.crawlerEvents.reduce((sum, item) => sum + item.bytes, 0);
  const robotsViolations = state.crawlerEvents.filter((item) => item.robots === "violated").length;
  return {
    totalRequests,
    blockedRequests,
    verifiedRate: totalRequests ? verifiedRequests / totalRequests * 100 : 0,
    bytes,
    robotsViolations,
  };
}

function ppcMetrics() {
  const totalAccesses = state.ppcEvents.reduce((sum, event) => sum + (event.accesses || 0), 0);
  const billableAccesses = state.ppcEvents
    .filter((event) => ["candidate", "sent", "passed"].includes(event.chargeState))
    .reduce((sum, event) => sum + (event.accesses || 0), 0);
  const passedAccesses = state.ppcEvents
    .filter((event) => event.chargeState === "passed")
    .reduce((sum, event) => sum + Math.round((event.accesses || 0) * (event.passRate || 0)), 0);
  const chargeAmount = state.ppcEvents.reduce((sum, event) => sum + (event.chargeAmount || 0), 0);
  const passedAmount = state.ppcEvents.reduce((sum, event) => sum + (event.passedAmount || 0), 0);
  const sentAmount = state.ppcEvents
    .filter((event) => event.chargeState === "sent" || event.status === "candidate")
    .reduce((sum, event) => sum + Math.max(0, (event.chargeAmount || 0) - (event.passedAmount || 0)), 0);
  const weightedPriceBase = state.ppcEvents.reduce((sum, event) => sum + ((event.price || 0) * (event.accesses || 0)), 0);
  const averagePrice = totalAccesses ? weightedPriceBase / totalAccesses : 0;
  const passageRate = billableAccesses ? passedAccesses / billableAccesses * 100 : 0;
  const candidateRequests = state.ppcRules.reduce((sum, rule) => sum + rule.monthly, 0);
  const expectedRevenue = state.ppcRules.reduce((sum, rule) => sum + rule.monthly * rule.acceptRate * rule.price, 0);
  const blocked = state.ppcEvents.filter((event) => event.status === "blocked" || event.status === "rejected").length;
  const payable = state.ppcEvents.filter((event) => event.status === "candidate").length;
  return {
    totalAccesses,
    billableAccesses,
    passedAccesses,
    chargeAmount,
    passedAmount,
    sentAmount,
    averagePrice,
    passageRate,
    candidateRequests,
    expectedRevenue,
    blocked,
    payable,
  };
}

function renderOverview() {
  const metrics = agencyMetrics();
  return `
    ${liveStatusPanel()}
    <section class="grid-4">
      ${metricCard("代理店売上", yen(metrics.clientRevenue), "3社の月額AEO/GEO運用費")}
      ${metricCard("Hackall利用料", yen(metrics.agencyFee), "Standard固定費")}
      ${metricCard("代理店粗利", yen(metrics.grossProfit), "API原価控除後", metrics.grossProfit >= 0 ? "delta-up" : "delta-down")}
      ${metricCard("平均SOV", `${metrics.avgSov.toFixed(1)}%`, "AI検索上の引用シェア")}
    </section>
    <section class="card">
      <h3>代理店向け粗利ブリッジ</h3>
      <div class="profit-bridge">
        <div class="bridge-node"><span class="small">エンド顧客3社</span><strong>${yen(metrics.clientRevenue)}</strong><span class="small">月10万円 × 3社</span></div>
        <div class="bridge-arrow">→</div>
        <div class="bridge-node"><span class="small">Hackall Standard</span><strong>${yen(metrics.agencyFee)}</strong><span class="small">固定利用料を回収</span></div>
        <div class="bridge-arrow">→</div>
        <div class="bridge-node"><span class="small">4社目以降</span><strong>粗利化</strong><span class="small">10社超でAdvanced提案</span></div>
      </div>
    </section>
    <section class="grid-2">
      <div class="card">
        <h3>SOV推移</h3>
        ${trendChart()}
      </div>
      <div class="card">
        <h3>営業ログ</h3>
        ${logList()}
      </div>
    </section>
    <section class="grid-2">
      <div class="card">
        <h3>企業導入で見るべきAIクローラー指標</h3>
        ${crawlerSummaryList()}
      </div>
      <div class="card">
        <h3>PPCは請求候補として検証</h3>
        ${ppcSummaryList()}
      </div>
    </section>
    ${clientTable()}
  `;
}

function liveStatusPanel() {
  const liveSince = state.liveSince
    ? new Date(state.liveSince).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
    : "-";
  return `
    <section class="live-panel">
      <div>
        <span class="live-dot ${state.liveMode ? "active" : ""}"></span>
        <strong>Live PoC mode</strong>
        <span>${state.liveMode ? "自動更新中" : "右上のボタンでライブ更新を開始"}</span>
      </div>
      <div><span>開始</span><strong>${liveSince}</strong></div>
      <div><span>更新回数</span><strong>${state.liveTickCount}</strong></div>
      <div><span>直近イベント</span><strong>${state.lastLiveEvent}</strong></div>
    </section>
  `;
}

function renderClients() {
  return `
    <section class="card">
      <h3>クライアント追加</h3>
      <div class="form-grid">
        <label>会社名<input id="clientName" placeholder="例: Tokyo Clinic Group"></label>
        <label>ドメイン<input id="clientDomain" placeholder="example.jp"></label>
        <label>販売月額<input id="clientFee" type="number" value="100000"></label>
        <button id="addClientButton" class="primary">追加</button>
      </div>
    </section>
    <section class="grid-3">
      ${state.clients.map((client) => `
        <article class="card">
          <h3>${client.name}</h3>
          <p class="small">${client.domain}</p>
          <div class="metric">${client.sov.toFixed(1)}<small>% SOV</small></div>
          <p><span class="tag ${client.status === "月次運用" ? "good" : "warn"}">${client.status}</span></p>
          <p class="small">販売月額 ${yen(client.fee)} / 監視KW ${client.keywords} / API原価 ${yen(client.apiCost)}</p>
        </article>
      `).join("")}
    </section>
    <section class="card">
      <h3>Standard枠の説明</h3>
      <p class="report-copy">営業では「3社でHackall費用を回収、4社目から粗利」と説明します。Standardは10社まで、1社50KWを目安にし、10社を超える代理店はAdvancedへ移行する設計です。</p>
    </section>
  `;
}

function renderMeasure() {
  return `
    <section class="card">
      <h3>キーワード設定</h3>
      <div class="form-grid">
        <label>キーワード<input id="keywordInput" placeholder="例: 家族信託 費用"></label>
        <label>顧客<select id="keywordClient">${state.clients.map((client) => `<option>${client.name}</option>`).join("")}</select></label>
        <label>月間検索Vol.<input id="keywordVol" type="number" value="1200"></label>
        <button id="addKeywordButton" class="primary">登録</button>
      </div>
    </section>
    <section class="table-wrap">
      <h3>citation結果</h3>
      ${keywordTable()}
    </section>
    <section class="grid-2">
      <div class="card">
        <h3>測定ジョブログ</h3>
        ${logList()}
      </div>
      <div class="card">
        <h3>営業時の説明</h3>
        <p class="report-copy">「デモ計測を実行」を押すと、疑似ジョブが走り、citation結果とログが追加されます。本番ではPerplexity API、PostgreSQL、GCP Cloud Tasksへ接続します。</p>
      </div>
    </section>
  `;
}

function renderCrawlerDetection() {
  const metrics = crawlerMetrics();
  const ppc = ppcMetrics();
  return `
    <section class="grid-4">
      ${metricCard("AI crawler requests", metrics.totalRequests.toLocaleString("ja-JP"), "対象期間内の検知数")}
      ${metricCard("Verified率", `${metrics.verifiedRate.toFixed(1)}%`, "署名・既知bot判定")}
      ${metricCard("Blocked / 402", metrics.blockedRequests.toLocaleString("ja-JP"), "遮断または支払い要求")}
      ${metricCard("転送量", `${metrics.bytes.toFixed(1)}GB`, "crawler別bytes")}
    </section>
    <section class="grid-4">
      ${metricCard("PPCアクセス合計", ppc.totalAccesses.toLocaleString("ja-JP"), "請求判定に入ったaccess")}
      ${metricCard("平均単価", `${ppc.averagePrice.toFixed(1)}円`, "weighted price / access")}
      ${metricCard("通行率", `${ppc.passageRate.toFixed(1)}%`, "通過済みaccess / 請求対象")}
      ${metricCard("通過済み請求", yen(Math.round(ppc.passedAmount)), "settledまたは通過確認済み")}
    </section>
    <section class="card">
      <h3>企業向けに取得・分析すべきデータ</h3>
      <div class="requirement-grid">
        ${requirementItem("Who", "crawler, operator, verified, detection_id", "どのAI企業・botが来ているか")}
        ${requirementItem("Where", "host, path, pattern, referrer", "どのサイト領域が狙われているか")}
        ${requirementItem("What happened", "status, bytes, request_count", "許可・遮断・402・転送量")}
        ${requirementItem("Policy", "robots, llms, content-signal, rule", "検索許可と学習制限の整合")}
        ${requirementItem("Risk", "unverified, violated, api path", "法務・情報資産リスク")}
        ${requirementItem("Action", "allow, block, pay_or_block", "代理店が顧客へ提案する施策")}
      </div>
    </section>
    <section class="grid-2">
      <div class="card">
        <h3>Operator別リスク分布</h3>
        ${operatorRiskBoard()}
      </div>
      <div class="card">
        <h3>Path pattern別の狙われ方</h3>
        ${pathPatternBoard()}
      </div>
    </section>
    <section class="table-wrap">
      <h3>AI crawler event detail</h3>
      ${crawlerEventTable()}
    </section>
    <section class="card">
      <h3>PPC請求ステータス</h3>
      ${ppcSettlementBoard()}
    </section>
    <section class="grid-2">
      <div class="card">
        <h3>robots / policy audit</h3>
        ${policyAuditBoard()}
      </div>
      <div class="card">
        <h3>UI/UXで必要な見せ方</h3>
        <p class="report-copy">経営者には損失とリスク、代理店には提案アクション、技術者にはログの根拠を分けて見せます。重要なのは、単なるアクセス数ではなく「どのAI企業が、どの価値あるページを、どの方針に反して取得したか」を説明できることです。</p>
        <div class="button-row"><button id="addCrawlerButton" class="secondary">疑似crawlerイベントを追加</button></div>
      </div>
    </section>
  `;
}

function renderPPC() {
  const metrics = ppcMetrics();
  return `
    <section class="grid-4">
      ${metricCard("アクセス合計", metrics.totalAccesses.toLocaleString("ja-JP"), "PPC判定ログの総access")}
      ${metricCard("平均単価", `${metrics.averagePrice.toFixed(1)}円`, "path別単価の加重平均")}
      ${metricCard("通行率", `${metrics.passageRate.toFixed(1)}%`, "請求対象accessのうち通過済み")}
      ${metricCard("請求総額", yen(Math.round(metrics.chargeAmount)), "投げた請求 + 通過済み + 拒否分")}
    </section>
    <section class="grid-3">
      ${metricCard("通過済み請求", yen(Math.round(metrics.passedAmount)), "settled / confirmed")}
      ${metricCard("請求送信中", yen(Math.round(metrics.sentAmount)), "402送信済み・未確定")}
      ${metricCard("拒否/遮断", `${metrics.blocked}件`, "価格不足・未検証")}
    </section>
    <section class="card">
      <h3>PPCで必要な機能要件</h3>
      <div class="requirement-grid">
        ${requirementItem("Price rules", "path pattern, category, exact/max price", "価値あるURLごとに価格を変える")}
        ${requirementItem("Crawler identity", "verified bot, signature, operator", "未検証botは課金ではなく遮断")}
        ${requirementItem("Decision engine", "allow, 402, block, bypass", "検索は許可、学習は有料などに分岐")}
        ${requirementItem("Payment evidence", "headers, signed components, event log", "支払い意思とレスポンスを監査可能にする")}
        ${requirementItem("Billing queue", "candidate, rejected, settled", "売上保証ではなく請求候補として扱う")}
        ${requirementItem("Reporting", "GMV, accepted, rejected, unrealized", "代理店・顧客へ説明できる形にする")}
      </div>
    </section>
    <section class="grid-2">
      <div class="card">
        <h3>価格ルール</h3>
        ${ppcRuleCards()}
      </div>
      <div class="card">
        <h3>402 decision simulator</h3>
        ${ppcDecisionSimulator()}
      </div>
    </section>
    <section class="table-wrap">
      <h3>PPC event ledger</h3>
      ${ppcEventTable()}
    </section>
    <section class="card">
      <h3>営業時の切り分け</h3>
      <p class="report-copy">PPC/x402は初期売上の本線にしません。画面では「請求候補」「価格不足」「未検証bot」「検索目的は無料許可」まで見せ、顧客にはAI bot制御と将来の収益化オプションとして説明します。</p>
    </section>
  `;
}

function crawlerSummaryList() {
  const metrics = crawlerMetrics();
  return `
    <div class="dense-list">
      <div><span>検知対象</span><strong>${metrics.totalRequests.toLocaleString("ja-JP")} requests</strong></div>
      <div><span>robots違反</span><strong class="${metrics.robotsViolations ? "delta-down" : "delta-up"}">${metrics.robotsViolations} operator</strong></div>
      <div><span>重点確認</span><strong>/api/* と training bot</strong></div>
      <div><span>顧客説明</span><strong>誰が何を取得したかを証跡化</strong></div>
    </div>
  `;
}

function ppcSummaryList() {
  const metrics = ppcMetrics();
  return `
    <div class="dense-list">
      <div><span>PPCアクセス合計</span><strong>${metrics.totalAccesses.toLocaleString("ja-JP")}</strong></div>
      <div><span>平均単価</span><strong>${metrics.averagePrice.toFixed(1)}円/access</strong></div>
      <div><span>通行率</span><strong>${metrics.passageRate.toFixed(1)}%</strong></div>
      <div><span>請求送信中</span><strong>${yen(Math.round(metrics.sentAmount))}</strong></div>
      <div><span>通過済み請求</span><strong>${yen(Math.round(metrics.passedAmount))}</strong></div>
      <div><span>初期営業</span><strong>収益保証ではなく検証枠</strong></div>
      <div><span>運用判断</span><strong>検索許可 / 学習有料 / 未検証遮断</strong></div>
    </div>
  `;
}

function ppcSettlementBoard() {
  const metrics = ppcMetrics();
  const rows = [
    ["アクセス合計", metrics.totalAccesses.toLocaleString("ja-JP"), "PPC判定対象になったAI crawlerアクセス"],
    ["請求対象access", metrics.billableAccesses.toLocaleString("ja-JP"), "402または支払い意思確認に進んだaccess"],
    ["通過済みaccess", metrics.passedAccesses.toLocaleString("ja-JP"), "通過確認済みとして扱うaccess"],
    ["請求だけ送信中", yen(Math.round(metrics.sentAmount)), "402は投げたが決済・通過は未確定"],
    ["通過済み請求", yen(Math.round(metrics.passedAmount)), "通過済みまたはsettled相当として表示"],
  ];
  return `
    <div class="settlement-board">
      ${rows.map(([label, value, help]) => `
        <div>
          <span>${label}</span>
          <strong>${value}</strong>
          <small>${help}</small>
        </div>
      `).join("")}
    </div>
  `;
}

function requirementItem(title, fields, body) {
  return `
    <div class="requirement-item">
      <strong>${title}</strong>
      <code>${fields}</code>
      <span>${body}</span>
    </div>
  `;
}

function operatorRiskBoard() {
  const grouped = groupBy(state.crawlerEvents, "operator");
  return `<div class="operator-board">${Object.entries(grouped).map(([operator, rows]) => {
    const requests = rows.reduce((sum, row) => sum + row.requests, 0);
    const high = rows.filter((row) => row.risk === "high").length;
    const percent = Math.min(100, Math.round(requests / 180));
    return `
      <div class="operator-row">
        <div><strong>${operator}</strong><span>${requests.toLocaleString("ja-JP")} req / high risk ${high}</span></div>
        <div class="mini-bar"><span style="width:${percent}%"></span></div>
      </div>
    `;
  }).join("")}</div>`;
}

function pathPatternBoard() {
  const grouped = groupBy(state.crawlerEvents, "pattern");
  return `<div class="operator-board">${Object.entries(grouped).map(([pattern, rows]) => {
    const requests = rows.reduce((sum, row) => sum + row.requests, 0);
    const bytes = rows.reduce((sum, row) => sum + row.bytes, 0);
    const hasPpc = state.ppcRules.some((rule) => rule.path === pattern);
    return `
      <div class="operator-row">
        <div><strong>${pattern}</strong><span>${requests.toLocaleString("ja-JP")} req / ${bytes.toFixed(1)}GB</span></div>
        <span class="tag ${hasPpc ? "warn" : "good"}">${hasPpc ? "PPC候補" : "通常監視"}</span>
      </div>
    `;
  }).join("")}</div>`;
}

function policyAuditBoard() {
  return `
    <div class="policy-stack">
      ${state.crawlerEvents.map((event) => `
        <div class="policy-row">
          <span class="tag ${event.risk === "high" ? "hot" : event.risk === "medium" ? "warn" : "good"}">${event.risk}</span>
          <div>
            <strong>${event.crawler} / ${event.pattern}</strong>
            <span>${event.robots} / ${event.policy} / HTTP ${event.status}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function crawlerEventTable() {
  return `
    <table>
      <thead><tr><th>Operator</th><th>Crawler</th><th>Host / path</th><th>Status</th><th>Requests</th><th>Bytes</th><th>Policy</th><th>Risk</th></tr></thead>
      <tbody>
        ${state.crawlerEvents.map((event) => `
          <tr>
            <td>${event.operator}</td>
            <td>${event.crawler}<br><span class="small">${event.category} / ${event.verified ? "verified" : "unverified"}</span></td>
            <td>${event.host}<br><span class="small">${event.path}</span></td>
            <td><span class="tag ${event.status === 200 ? "good" : event.status === 402 ? "warn" : "hot"}">${event.status}</span></td>
            <td>${event.requests.toLocaleString("ja-JP")}</td>
            <td>${event.bytes.toFixed(1)}GB</td>
            <td>${event.policy}<br><span class="small">robots: ${event.robots}</span></td>
            <td><span class="tag ${event.risk === "high" ? "hot" : event.risk === "medium" ? "warn" : "good"}">${event.risk}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function ppcRuleCards() {
  return `<div class="policy-stack">${state.ppcRules.map((rule) => {
    const revenue = Math.round(rule.monthly * rule.acceptRate * rule.price);
    const matchingEvents = state.ppcEvents.filter((event) => event.path.startsWith(rule.path.replace("*", "")));
    const accessCount = matchingEvents.reduce((sum, event) => sum + (event.accesses || 0), 0);
    const passedAmount = matchingEvents.reduce((sum, event) => sum + (event.passedAmount || 0), 0);
    return `
      <div class="rule-card">
        <div>
          <strong>${rule.path}</strong>
          <span>${rule.reason}</span>
        </div>
        <div class="rule-price">${rule.price}円/request</div>
        <div class="small">${rule.mode} / ${rule.action} / 想定 ${yen(revenue)}</div>
        <div class="small">実ログ ${accessCount.toLocaleString("ja-JP")} access / 通過済み ${yen(Math.round(passedAmount))}</div>
      </div>
    `;
  }).join("")}</div>`;
}

function ppcDecisionSimulator() {
  return `
    <div class="simulator">
      <label>対象path
        <select id="ppcPathInput">
          ${state.ppcRules.map((rule) => `<option value="${rule.path}">${rule.path}</option>`).join("")}
        </select>
      </label>
      <label>crawler max price
        <input id="ppcMaxInput" type="number" value="6">
      </label>
      <label>access count
        <input id="ppcAccessInput" type="number" value="120">
      </label>
      <label>crawler identity
        <select id="ppcVerifiedInput">
          <option value="verified">verified</option>
          <option value="unverified">unverified</option>
        </select>
      </label>
      <button id="simulatePpcButton" class="primary">判定する</button>
      <div id="ppcSimulationResult" class="simulation-result">価格ルールとidentityを入力して判定します。</div>
    </div>
  `;
}

function ppcEventTable() {
  return `
    <table>
      <thead><tr><th>Time</th><th>Crawler</th><th>Path</th><th>Access</th><th>単価</th><th>請求額</th><th>通過額</th><th>通行率</th><th>請求状態</th><th>Reason</th></tr></thead>
      <tbody>
        ${state.ppcEvents.map((event) => `
          <tr>
            <td>${event.time}</td>
            <td>${event.crawler}</td>
            <td>${event.path}</td>
            <td>${(event.accesses || 0).toLocaleString("ja-JP")}</td>
            <td>${event.price}円<br><span class="small">max ${event.max}円</span></td>
            <td>${yen(Math.round(event.chargeAmount || 0))}</td>
            <td>${yen(Math.round(event.passedAmount || 0))}</td>
            <td>${((event.passRate || 0) * 100).toFixed(1)}%</td>
            <td><span class="tag ${ppcStateTone(event)}">${ppcStateLabel(event)}</span><br><span class="small">${event.status}</span></td>
            <td>${event.reason}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function ppcStateLabel(event) {
  const labels = {
    passed: "通過済み",
    sent: "請求送信中",
    rejected: "拒否",
    blocked: "遮断",
    free_allowed: "無料許可",
  };
  return labels[event.chargeState] || "請求候補";
}

function ppcStateTone(event) {
  if (event.chargeState === "passed" || event.chargeState === "free_allowed") return "good";
  if (event.chargeState === "sent" || event.status === "candidate") return "warn";
  return "hot";
}

function renderReports() {
  const copies = {
    executive: "経営者向けには、AI検索で自社が引用されていない損失を中心に説明します。競合に引用シェアを奪われているキーワードを見せ、月次で改善余地を管理する提案にします。",
    agency: "代理店向けには、既存SEO顧客へ追加で売れる月額商材として説明します。3社で固定費を回収し、4社目以降が粗利になるため、営業部門の新しい提案カードになります。",
    engineer: "技術者向けには、Perplexity citationsをJSONBで保存し、ドメイン照合、SOV集計、Cloud Tasksによるエンジン別レート制御を行う構成として説明します。",
  };
  return `
    <section class="card">
      <h3>レポート表示切替</h3>
      <div class="segmented">
        <button data-report="executive" class="${state.activeReport === "executive" ? "active" : ""}">経営者向け</button>
        <button data-report="agency" class="${state.activeReport === "agency" ? "active" : ""}">代理店向け</button>
        <button data-report="engineer" class="${state.activeReport === "engineer" ? "active" : ""}">技術者向け</button>
      </div>
      <p class="report-copy">${copies[state.activeReport]}</p>
    </section>
    <section class="grid-3">
      ${metricCard("未露出KW", "18", "競合のみ引用")}
      ${metricCard("改善候補URL", "12", "追記・構造化対象")}
      ${metricCard("次回提案額", yen(300000), "月次AEO運用")}
    </section>
    <section class="table-wrap">
      <h3>レポート用キーワード抜粋</h3>
      ${keywordTable(5)}
    </section>
  `;
}

function renderBilling() {
  return `
    <section class="grid-3">
      ${planCard("Standard", "30万円", "10社 / 50KW / 週次Perplexity", true)}
      ${planCard("Advanced", "60万円", "30社 / 100KW / 複数エンジン", false)}
      ${planCard("Enterprise", "個別", "大手・API上限・専用レポート", false)}
    </section>
    <section class="table-wrap">
      <h3>請求書</h3>
      <table>
        <thead><tr><th>ID</th><th>内容</th><th>金額</th><th>状態</th><th></th></tr></thead>
        <tbody>
          ${state.invoices.map((invoice) => `
            <tr>
              <td>${invoice.id}</td><td>${invoice.client}</td><td>${yen(invoice.amount)}</td>
              <td><span class="tag ${invoice.status.includes("入金") ? "good" : "warn"}">${invoice.status}</span></td>
              <td><button class="secondary markPaidButton" data-id="${invoice.id}">入金確認</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="button-row"><button id="issueInvoiceButton" class="primary">請求書を発行</button></div>
    </section>
  `;
}

function renderSetup() {
  const entries = [
    ["agency", "代理店申込", "契約主体、担当者、販売地域を確定"],
    ["contract", "販売条件", "Standard/Advanced、最低契約期間、初期費用を合意"],
    ["client", "初回顧客登録", "顧客名、対象ドメイン、競合ドメインを登録"],
    ["keywords", "キーワード設計", "商談で見せる20〜50KWを選定"],
    ["firstRun", "初回測定", "Perplexity citationsを保存し、SOVを算出"],
    ["report", "月次レポート", "経営者向け資料と代理店向け説明文を生成"],
  ];
  const done = Object.values(state.checklist).filter(Boolean).length;
  return `
    <section class="card">
      <h3>導入進捗 ${done}/${entries.length}</h3>
      <div class="progress"><span style="width:${Math.round(done / entries.length * 100)}%"></span></div>
    </section>
    <section class="grid-2">
      ${entries.map(([key, title, body]) => `
        <label class="setup-row">
          <input type="checkbox" data-check="${key}" ${state.checklist[key] ? "checked" : ""}>
          <span><strong>${title}</strong><br><span class="small">${body}</span></span>
        </label>
      `).join("")}
    </section>
  `;
}

function renderAdctor() {
  return `
    <section class="grid-3">
      ${metricCard("AI botログ", "34,219", "月間検知イベント")}
      ${metricCard("402イベント", "178", "PPC検証対象")}
      ${metricCard("PPC想定GMV", yen(101000), "本線売上には入れない")}
    </section>
    <section class="card">
      <h3>PPC Showroom</h3>
      <p class="report-copy">PPC/x402は将来構想です。営業では、AI企業からの自動課金を売上保証として語らず、診断SaaS・月次レポート・AEO運用の価値を主軸にします。</p>
      <button id="add402Button" class="secondary">疑似402イベントを追加</button>
    </section>
    <section class="card">
      <h3>イベントログ</h3>
      ${logList()}
    </section>
  `;
}

function bindViewEvents() {
  document.querySelectorAll("[data-report]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeReport = button.dataset.report;
      render();
    });
  });
  const addClient = document.querySelector("#addClientButton");
  if (addClient) addClient.addEventListener("click", addClientFromForm);
  const addKeyword = document.querySelector("#addKeywordButton");
  if (addKeyword) addKeyword.addEventListener("click", addKeywordFromForm);
  const issueInvoiceButton = document.querySelector("#issueInvoiceButton");
  if (issueInvoiceButton) issueInvoiceButton.addEventListener("click", issueInvoice);
  document.querySelectorAll(".markPaidButton").forEach((button) => {
    button.addEventListener("click", () => markInvoicePaid(button.dataset.id));
  });
  document.querySelectorAll("[data-check]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      state.checklist[checkbox.dataset.check] = checkbox.checked;
      render();
    });
  });
  const add402 = document.querySelector("#add402Button");
  if (add402) add402.addEventListener("click", () => {
    pushEvent("402 Payment Requiredを疑似生成しました");
    render();
    showToast("PPC Showroomに疑似イベントを追加しました。");
  });
  const addCrawler = document.querySelector("#addCrawlerButton");
  if (addCrawler) addCrawler.addEventListener("click", addCrawlerEvent);
  const simulatePpc = document.querySelector("#simulatePpcButton");
  if (simulatePpc) simulatePpc.addEventListener("click", simulatePpcDecision);
}

function addClientFromForm() {
  const name = document.querySelector("#clientName").value.trim();
  const domain = document.querySelector("#clientDomain").value.trim();
  const fee = Number(document.querySelector("#clientFee").value || 100000);
  if (!name || !domain) {
    showToast("会社名とドメインを入力してください。", true);
    return;
  }
  state.clients.push({ id: `c-${Date.now()}`, name, domain, plan: "Standard", fee, sov: 8.5, status: "提案中", keywords: 0, apiCost: 3000 });
  pushEvent(`${name}をクライアント管理に追加`);
  render();
  showToast("クライアントを追加しました。");
}

function addKeywordFromForm() {
  const keyword = document.querySelector("#keywordInput").value.trim();
  const client = document.querySelector("#keywordClient").value;
  const vol = Number(document.querySelector("#keywordVol").value || 0);
  if (!keyword) {
    showToast("キーワードを入力してください。", true);
    return;
  }
  state.keywords.unshift({ keyword, client, vol, engine: "Perplexity", cited: false, url: "", position: 0, sov: 0 });
  const target = state.clients.find((item) => item.name === client);
  if (target) target.keywords += 1;
  pushEvent(`${keyword}を監視キーワードに登録`);
  render();
  showToast("キーワードを登録しました。");
}

function runDemoMeasure() {
  const item = buildMeasurementSample();
  state.keywords.unshift(item);
  state.clients.forEach((client) => {
    client.sov = Number((client.sov + Math.random() * 1.8).toFixed(1));
  });
  pushEvent(`${item.keyword}のデモ計測が完了`);
  render();
  showToast("疑似測定ジョブが完了し、citation結果を追加しました。");
}

function buildMeasurementSample() {
  const samples = [
    ["AI検索 対策 代理店", "Regalis Japan Group", "https://regalis-group.jp/aeo-guide"],
    ["地域名 サービス 比較", "Sample Food Co.", "https://sample-food.co.jp/local-delivery"],
    ["工場 自動化 ソリューション", "Smart FA Tech", "https://smart-fa-tech.jp/solutions/iot-gateway"],
  ];
  const sample = samples[Math.floor(Math.random() * samples.length)];
  return {
    keyword: sample[0],
    client: sample[1],
    vol: 1200 + Math.floor(Math.random() * 8800),
    engine: "Perplexity",
    cited: true,
    url: sample[2],
    position: 1 + Math.floor(Math.random() * 3),
    sov: Number((18 + Math.random() * 28).toFixed(1)),
  };
}

function addCrawlerEvent() {
  const event = buildCrawlerEventSample();
  state.crawlerEvents.unshift(event);
  pushEvent(`${event.crawler}をAI crawler検知へ追加`);
  render();
  showToast("AIクローラー検知イベントを追加しました。");
}

function buildCrawlerEventSample() {
  const samples = [
    { operator: "Google", crawler: "GoogleExtended", category: "Training", host: "regalis-group.jp", path: "/lookbook/2026", pattern: "/lookbook/*", status: 403, requests: 620, bytes: 0.3, verified: true, robots: "blocked", referrer: "-", risk: "medium", policy: "block_training" },
    { operator: "Meta", crawler: "meta-externalagent", category: "Training", host: "smart-fa-tech.jp", path: "/whitepaper/robot-cost", pattern: "/whitepaper/*", status: 402, requests: 410, bytes: 0.5, verified: true, robots: "allowed", referrer: "-", risk: "medium", policy: "pay_or_block" },
    { operator: "Unknown", crawler: "HeadlessAI/0.9", category: "Unknown", host: "sample-food.co.jp", path: "/api/pricing", pattern: "/api/*", status: 403, requests: 190, bytes: 0.1, verified: false, robots: "blocked", referrer: "-", risk: "high", policy: "block" },
  ];
  const event = { ...samples[Math.floor(Math.random() * samples.length)] };
  event.requests += Math.floor(Math.random() * 140);
  event.bytes = Number((event.bytes + Math.random() * 0.3).toFixed(1));
  return event;
}

function simulatePpcDecision() {
  const path = document.querySelector("#ppcPathInput").value;
  const max = Number(document.querySelector("#ppcMaxInput").value || 0);
  const accesses = Number(document.querySelector("#ppcAccessInput").value || 0);
  const verified = document.querySelector("#ppcVerifiedInput").value === "verified";
  const rule = state.ppcRules.find((item) => item.path === path);
  const result = document.querySelector("#ppcSimulationResult");
  if (!rule) return;

  let status = "candidate";
  let chargeState = "sent";
  let reason = "payment intent accepted";
  let passRate = 0;
  if (!verified) {
    status = "blocked";
    chargeState = "blocked";
    reason = "unverified crawler";
  } else if (max < rule.price) {
    status = "rejected";
    chargeState = "rejected";
    reason = "max price below rule";
  } else if (max >= rule.price + 2) {
    chargeState = "passed";
    passRate = 0.62;
    reason = "payment passed";
  }
  const chargeAmount = rule.price * accesses;
  const passedAmount = chargeState === "passed" ? Math.round(chargeAmount * passRate) : 0;

  state.ppcEvents.unshift({
    time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    crawler: verified ? "VerifiedCrawler" : "UnknownCrawler",
    path,
    accesses,
    price: rule.price,
    max,
    passRate,
    chargeAmount,
    passedAmount,
    status,
    chargeState,
    reason,
  });
  result.innerHTML = `<strong>${ppcStateLabel({ chargeState, status })}</strong><span>${reason} / ${accesses.toLocaleString("ja-JP")} access × ${rule.price}円 = ${yen(chargeAmount)} / 通過額 ${yen(passedAmount)}</span>`;
  pushEvent(`${path}のPPC判定: ${status}`);
  showToast("PPC判定をイベント台帳に追加しました。");
}

function toggleLiveMode() {
  if (state.liveMode) {
    stopLiveMode();
    render();
    showToast("ライブPoCモードを停止しました。");
    return;
  }
  startLiveMode();
  render();
  showToast("ライブPoCモードを開始しました。画面が自動更新されます。");
}

function startLiveMode() {
  if (liveTimer) window.clearInterval(liveTimer);
  state.liveMode = true;
  state.liveSince = new Date().toISOString();
  state.lastLiveEvent = "ライブ更新を開始";
  liveTimer = window.setInterval(runLiveTick, 4200);
  updateLiveButton();
  window.setTimeout(runLiveTick, 700);
}

function stopLiveMode() {
  if (liveTimer) window.clearInterval(liveTimer);
  liveTimer = null;
  state.liveMode = false;
  state.lastLiveEvent = "停止中";
  updateLiveButton();
}

function runLiveTick() {
  if (!state.liveMode || !state.loggedIn) return;
  state.liveTickCount += 1;

  if (state.liveTickCount % 3 === 1) {
    const item = buildMeasurementSample();
    state.keywords.unshift(item);
    state.keywords = state.keywords.slice(0, 18);
    state.clients.forEach((client) => {
      client.sov = Number((client.sov + 0.2 + Math.random() * 0.8).toFixed(1));
      client.apiCost += 120 + Math.floor(Math.random() * 280);
    });
    state.lastLiveEvent = `AI計測: ${item.keyword}`;
    pushEvent(`${item.keyword}をライブ計測で保存`);
  } else if (state.liveTickCount % 3 === 2) {
    const event = buildCrawlerEventSample();
    state.crawlerEvents.unshift(event);
    state.crawlerEvents = state.crawlerEvents.slice(0, 18);
    state.lastLiveEvent = `crawler: ${event.crawler} ${event.status}`;
    pushEvent(`${event.crawler}の実ログ風イベントを受信`);
  } else {
    const event = buildLivePpcEvent();
    state.ppcEvents.unshift(event);
    state.ppcEvents = state.ppcEvents.slice(0, 18);
    state.lastLiveEvent = `PPC: ${event.status} ${event.path}`;
    pushEvent(`${event.path}の402候補を判定`);
  }

  render();
}

function buildLivePpcEvent() {
  const rule = state.ppcRules[Math.floor(Math.random() * state.ppcRules.length)];
  const verified = Math.random() > 0.18;
  const max = verified ? Math.max(0, rule.price + Math.floor(Math.random() * 7) - 2) : 0;
  const accesses = 80 + Math.floor(Math.random() * 420);
  let status = "candidate";
  let chargeState = "sent";
  let reason = "payment intent detected";
  let passRate = 0;
  if (!verified) {
    status = "blocked";
    chargeState = "blocked";
    reason = "unverified crawler";
  } else if (max < rule.price) {
    status = "rejected";
    chargeState = "rejected";
    reason = "max price below rule";
  } else if (Math.random() > 0.42) {
    chargeState = "passed";
    passRate = Number((0.38 + Math.random() * 0.34).toFixed(2));
    reason = "payment passed";
  }
  const chargeAmount = rule.price * accesses;
  const passedAmount = chargeState === "passed" ? Math.round(chargeAmount * passRate) : 0;
  return {
    time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    crawler: verified ? "VerifiedCrawler" : "UnknownCrawler",
    path: rule.path.replace("*", ["executive", "style-guide", "robot-cost", "pricing"][Math.floor(Math.random() * 4)]),
    accesses,
    price: rule.price,
    max,
    passRate,
    chargeAmount,
    passedAmount,
    status,
    chargeState,
    reason,
  };
}

function issueInvoice() {
  const id = `INV-2026-${String(state.invoices.length + 1).padStart(3, "0")}`;
  state.invoices.unshift({ id, client: "Hackall Standard 月額", amount: 300000, status: "請求書発行済" });
  pushEvent(`${id}を発行`);
  render();
  showToast("請求書を発行しました。");
}

function markInvoicePaid(id) {
  const invoice = state.invoices.find((item) => item.id === id);
  if (invoice) invoice.status = "入金確認済";
  pushEvent(`${id}の入金を確認`);
  render();
  showToast("入金確認を反映しました。");
}

function downloadCsv() {
  let filename = "hackall_demo_results.csv";
  let header = "keyword,client,volume,engine,is_cited,cited_url,cited_position,sov\n";
  let rows = state.keywords.map((item) => [
    item.keyword, item.client, item.vol, item.engine, item.cited, item.url, item.position, item.sov,
  ].map(csvCell).join(",")).join("\n");

  if (state.activeView === "crawler") {
    filename = "hackall_ai_crawler_events.csv";
    header = "operator,crawler,category,host,path,pattern,status,requests,bytes_gb,verified,robots,policy,risk,referrer\n";
    rows = state.crawlerEvents.map((item) => [
      item.operator, item.crawler, item.category, item.host, item.path, item.pattern, item.status, item.requests, item.bytes, item.verified, item.robots, item.policy, item.risk, item.referrer,
    ].map(csvCell).join(",")).join("\n");
  }

  if (state.activeView === "ppc") {
    filename = "hackall_ppc_events.csv";
    header = "time,crawler,path,accesses,unit_price,max_price,charge_amount,passed_amount,passage_rate,charge_state,status,reason\n";
    rows = state.ppcEvents.map((item) => [
      item.time, item.crawler, item.path, item.accesses, item.price, item.max, item.chargeAmount, item.passedAmount, item.passRate, item.chargeState, item.status, item.reason,
    ].map(csvCell).join(",")).join("\n");
  }

  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function metricCard(label, value, body, tone = "") {
  return `<article class="card"><h3>${label}</h3><div class="metric ${tone}">${value}</div><p class="small">${body}</p></article>`;
}

function planCard(name, price, scope, featured) {
  return `<article class="card plan ${featured ? "featured" : ""}"><h3>${name}</h3><div class="price">${price}</div><p class="small">${scope}</p><button class="${featured ? "primary" : "secondary"}">営業資料に反映</button></article>`;
}

function clientTable() {
  return `
    <section class="table-wrap">
      <h3>代理店配下の顧客</h3>
      <table>
        <thead><tr><th>顧客</th><th>ドメイン</th><th>状態</th><th>月額</th><th>SOV</th><th>KW</th></tr></thead>
        <tbody>
          ${state.clients.map((client) => `
            <tr><td>${client.name}</td><td>${client.domain}</td><td><span class="tag good">${client.status}</span></td><td>${yen(client.fee)}</td><td>${client.sov.toFixed(1)}%</td><td>${client.keywords}</td></tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function keywordTable(limit = state.keywords.length) {
  return `
    <table>
      <thead><tr><th>キーワード</th><th>顧客</th><th>Vol.</th><th>Engine</th><th>引用</th><th>URL</th><th>SOV</th></tr></thead>
      <tbody>
        ${state.keywords.slice(0, limit).map((row) => `
          <tr>
            <td>${row.keyword}</td><td>${row.client}</td><td>${row.vol.toLocaleString("ja-JP")}</td><td>${row.engine}</td>
            <td><span class="tag ${row.cited ? "good" : "hot"}">${row.cited ? `${row.position}位` : "なし"}</span></td>
            <td>${row.url || "競合のみ引用"}</td><td>${row.sov}%</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function trendChart() {
  const points = [18, 19.8, 21.2, 23.5, 26.4, 29.2].map((value, index) => `${40 + index * 84},${210 - value * 5}`);
  return `
    <svg class="chart" viewBox="0 0 520 250" role="img" aria-label="SOV推移グラフ">
      <line x1="38" y1="210" x2="492" y2="210" stroke="rgba(255,250,240,.16)" />
      <line x1="38" y1="42" x2="38" y2="210" stroke="rgba(255,250,240,.16)" />
      <polyline fill="none" stroke="#c6a15b" stroke-width="4" points="${points.join(" ")}" />
      ${points.map((point) => {
        const [x, y] = point.split(",");
        return `<circle cx="${x}" cy="${y}" r="5" fill="#58c4dd" />`;
      }).join("")}
      <text x="40" y="232" fill="#9fa7a9" font-size="12">1月</text>
      <text x="458" y="232" fill="#9fa7a9" font-size="12">6月</text>
      <text x="396" y="52" fill="#fffaf0" font-size="14">+11.2pt</text>
    </svg>
  `;
}

function logList() {
  return `<div class="log-list">${state.events.map((event) => {
    const [time, ...rest] = event.split(" ");
    return `<div class="log-row"><span>${time}</span><strong>${rest.join(" ")}</strong></div>`;
  }).join("")}</div>`;
}

function pushEvent(text) {
  const now = new Date();
  const time = now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  state.events.unshift(`${time} ${text}`);
  state.events = state.events.slice(0, 12);
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key];
    if (!acc[value]) acc[value] = [];
    acc[value].push(item);
    return acc;
  }, {});
}

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.borderColor = isError ? "rgba(228,93,68,.4)" : "rgba(126,163,107,.35)";
  toast.style.background = isError ? "rgba(228,93,68,.12)" : "rgba(126,163,107,.12)";
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 3200);
}

function updateLiveButton() {
  const button = document.querySelector("#toggleLiveButton");
  if (!button) return;
  button.textContent = state.liveMode ? "ライブPoC: ON" : "ライブPoC: OFF";
  button.classList.toggle("live-active", state.liveMode);
}

function yen(value) {
  return `¥${Number(value).toLocaleString("ja-JP")}`;
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}
