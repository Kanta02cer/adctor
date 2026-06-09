"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthly = [
  { month: "1月", revenue: 42000, requests: 8400 },
  { month: "2月", revenue: 58000, requests: 11200 },
  { month: "3月", revenue: 71000, requests: 14300 },
  { month: "4月", revenue: 89000, requests: 17800 },
  { month: "5月", revenue: 124000, requests: 24800 },
  { month: "6月", revenue: 142500, requests: 28500 },
];

export default function AnalyticsPage() {
  return (
    <div className="p-4 sm:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">分析</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-panel">
          <CardHeader><CardTitle className="text-sm text-white/70">月次収益推移</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `¥${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff20", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`¥${Number(v).toLocaleString()}`, "収益"]} />
                <Bar dataKey="revenue" fill="#B89F5D" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader><CardTitle className="text-sm text-white/70">月次リクエスト数推移</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#ffffff40", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #ffffff20", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="requests" stroke="#D9C38E" strokeWidth={2} dot={{ fill: "#D9C38E", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
