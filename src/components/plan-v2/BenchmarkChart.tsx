import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { BenchmarkTarget } from "@/lib/benchmarkTargets";

interface BenchmarkChartProps {
  age: number | null;
  target: BenchmarkTarget | null;
  annualIncome: number;
  netWorth: number;
  liquidSavings: number;
  monthlyExpenses: number;
}

const currency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export const BenchmarkChart = ({
  age,
  target,
  annualIncome,
  netWorth,
  liquidSavings,
  monthlyExpenses,
}: BenchmarkChartProps) => {
  if (!target || annualIncome <= 0) {
    return (
      <Card className="border-white/10 bg-white/5 text-white plan-v2-print-section">
        <CardHeader>
          <CardTitle className="text-white">Benchmark Position</CardTitle>
          <CardDescription className="text-white/60">
            Add age and income data to view benchmark positioning.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const targetNetWorth = target.targetNetWorthMultiple * annualIncome;
  const currentSavingsMonths = monthlyExpenses > 0 ? liquidSavings / monthlyExpenses : 0;

  const data = [
    {
      metric: "Net Worth",
      current: Math.max(0, netWorth),
      target: targetNetWorth,
    },
    {
      metric: "Savings Runway (Months)",
      current: currentSavingsMonths,
      target: target.targetSavingsMonths,
    },
  ];

  return (
    <Card className="border-white/10 bg-white/5 text-white plan-v2-print-section">
      <CardHeader>
        <CardTitle className="text-white">Benchmark Position</CardTitle>
        <CardDescription className="text-white/60">
          Age {age} target comparison against your current financial position
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis dataKey="metric" stroke="rgba(226,232,240,0.7)" />
              <YAxis stroke="rgba(226,232,240,0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  borderRadius: 12,
                }}
                formatter={(value: number, key: string, item: { payload?: { metric?: string } }) => {
                  const isMoney = item?.payload?.metric === "Net Worth";
                  return [isMoney ? currency(value) : value.toFixed(2), key];
                }}
              />
              <Legend />
              <Bar dataKey="current" fill="hsl(var(--secondary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="target" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-white/50">Target Net Worth</p>
            <p className="mt-2 text-xl font-heading text-white">{currency(targetNetWorth)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wider text-white/50">Target Savings Runway</p>
            <p className="mt-2 text-xl font-heading text-white">{target.targetSavingsMonths.toFixed(1)} months</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
