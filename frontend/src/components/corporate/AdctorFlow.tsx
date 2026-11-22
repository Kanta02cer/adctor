"use client";

import { useState } from "react";
import styles from "./corporate.module.css";

type Mode = "data" | "money";

const COPY: Record<Mode, { lead: string; note?: string }> = {
  data: {
    lead: "提供者がAdctorに利用条件を示し、AdctorがAIクローラーやAIエージェントのアクセスを判別して条件を伝えます。条件にもとづくアクセスは、誰が・どの情報を・いつ取得したかとともに記録されます。",
  },
  money: {
    lead: "AI事業者は利用に応じて対価を支払い、Adctorは記録にもとづいて精算し、提供者へ分配します。誰が払い、誰に戻るのかを、記録で確かめられるようにします。",
    note: "お金の流れは、将来の請求・分配への接続を想定した設計です（研究開発・構想段階）。",
  },
};

function Arrow({ kind, dir, label, dim }: { kind: Mode; dir: "forward" | "back"; label: string; dim: boolean }) {
  return (
    <div className={styles.flowArrow} data-kind={kind} data-dir={dir} data-dim={dim}>
      <span className={styles.flowArrowLabel}>{label}</span>
      <span className={styles.flowArrowLine} aria-hidden="true" />
    </div>
  );
}

export function AdctorFlow() {
  const [mode, setMode] = useState<Mode>("data");
  const copy = COPY[mode];

  return (
    <div className={styles.flow}>
      <div className={styles.flowTabs} role="group" aria-label="表示する流れ">
        <button type="button" aria-pressed={mode === "data"} onClick={() => setMode("data")} className={styles.flowTab}>
          <span className={styles.flowSwatch} data-kind="data" aria-hidden="true" />
          データの流れ
        </button>
        <button type="button" aria-pressed={mode === "money"} onClick={() => setMode("money")} className={styles.flowTab}>
          <span className={styles.flowSwatch} data-kind="money" aria-hidden="true" />
          お金の流れ
        </button>
      </div>

      <div className={styles.flowDiagram}>
        <div className={styles.flowNode}>
          <p className={styles.flowNodeEn}>PROVIDER</p>
          <p className={styles.flowNodeName}>提供者</p>
          <p className={styles.flowNodeDesc}>記事・画像・専門データをつくる発信者、メディア、専門データベース</p>
        </div>

        <div className={styles.flowConnector}>
          <Arrow kind="data" dir="forward" label="利用条件を示す" dim={mode !== "data"} />
          <Arrow kind="money" dir="back" label="記録にもとづく分配" dim={mode !== "money"} />
        </div>

        <div className={styles.flowNode} data-hub="">
          <p className={styles.flowNodeEn}>PLATFORM</p>
          <p className={styles.flowNodeName}>Adctor</p>
          <p className={styles.flowNodeDesc}>利用条件・アクセスの記録・精算をつなぐ</p>
        </div>

        <div className={styles.flowConnector}>
          <Arrow kind="data" dir="forward" label="条件にもとづくアクセス" dim={mode !== "data"} />
          <Arrow kind="money" dir="back" label="利用に応じた支払い" dim={mode !== "money"} />
        </div>

        <div className={styles.flowNode}>
          <p className={styles.flowNodeEn}>AI COMPANY</p>
          <p className={styles.flowNodeName}>AI事業者</p>
          <p className={styles.flowNodeDesc}>AIの検索・回答・RAG・MCP・エージェントで情報を使う事業者</p>
        </div>
      </div>

      <div className={styles.flowLegend}>
        <p>
          <span className={styles.flowSwatch} data-kind="data" aria-hidden="true" />
          データ：提供者 → Adctor → AI事業者
        </p>
        <p data-kind="money">
          <span className={styles.flowSwatch} data-kind="money" aria-hidden="true" />
          お金：AI事業者 → Adctor → 提供者
        </p>
      </div>

      <div aria-live="polite" className={styles.flowCopy}>
        <p>{copy.lead}</p>
        {copy.note && <p className={styles.flowNote}>{copy.note}</p>}
      </div>
    </div>
  );
}
