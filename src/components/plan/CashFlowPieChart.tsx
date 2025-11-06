import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface CashFlowSlice {
  label: string;
  amount: number;
  chartColor: string;
}

interface CashFlowPieChartProps {
  data: CashFlowSlice[];
  totalLabel?: string;
  inflowTotal?: number;
}

const RADIAN = Math.PI / 180;

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", {
    maximumFractionDigits: value < 1000 ? 2 : 0,
  })}`;

const renderLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#F8FAFC"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

export const CashFlowPieChart = ({
  data,
  totalLabel = "Total Inflow",
  inflowTotal,
}: CashFlowPieChartProps) => {
  const totalAmount =
    typeof inflowTotal === "number" && !Number.isNaN(inflowTotal)
      ? inflowTotal
      : data.reduce((sum, slice) => sum + slice.amount, 0);

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <defs>
            {data.map((slice, index) => (
              <radialGradient key={slice.label} id={`cashflow-slice-${index}`}>
                <stop offset="0%" stopColor="rgba(248, 250, 252, 0.15)" />
                <stop offset="55%" stopColor="rgba(248, 250, 252, 0.45)" />
                <stop offset="100%" stopColor={slice.chartColor} />
              </radialGradient>
            ))}
          </defs>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
            paddingAngle={2}
            stroke="rgba(148, 163, 184, 0.3)"
            strokeWidth={1}
            labelLine={false}
            label={renderLabel}
          >
            {data.map((slice, index) => (
              <Cell
                key={slice.label}
                fill={`url(#cashflow-slice-${index})`}
                stroke={slice.chartColor}
                strokeWidth={1}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: number, _name, payload: any) => [
              formatCurrency(value),
              payload?.payload?.label,
            ]}
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.92)",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              color: "#E2E8F0",
              backdropFilter: "blur(12px)",
            }}
          />
          <Legend
            wrapperStyle={{ color: "#cbd5f5" }}
            formatter={(value: string) => <span className="text-xs text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-white/60">
        {totalLabel}: <span className="font-semibold text-white">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
};

export default CashFlowPieChart;
