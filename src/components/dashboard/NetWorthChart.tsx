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
      <Card>
        <CardHeader>
          <CardTitle>Net Worth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Worth Over Time</CardTitle>
        <CardDescription>Track your financial growth month by month</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="netWorth" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground">No history data available yet</p>
        )}
      </CardContent>
    </Card>
  );
};
