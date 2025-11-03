import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NetWorthChartProps {
  userId: string;
}

export const NetWorthChart = ({ userId }: NetWorthChartProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const { data: historyData, error } = await supabase
        .from("net_worth_history")
        .select("*")
        .eq("user_id", userId)
        .order("year", { ascending: true })
        .order("month", { ascending: true });

      if (error) throw error;

      const formattedData = (historyData || []).map((item) => ({
        date: `${item.month}/${item.year}`,
        netWorth: Number(item.net_worth),
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching net worth history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Net Worth Over Time</CardTitle>
          <CardDescription className="text-white/60">
            Tracking momentum across the last horizon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/60">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Net Worth Over Time</CardTitle>
        <CardDescription className="text-white/60">
          Track your financial growth month by month
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="date" stroke="rgba(226,232,240,0.5)" tick={{ fill: "rgba(226,232,240,0.6)" }} />
              <YAxis stroke="rgba(226,232,240,0.5)" tick={{ fill: "rgba(226,232,240,0.6)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "16px",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#e2e8f0",
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-white/60">No history data available yet</p>
        )}
      </CardContent>
    </Card>
  );
};
