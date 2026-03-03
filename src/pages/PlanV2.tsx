import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { secureLogger } from "@/lib/secureLogger";
import { CashFlowPieChart } from "@/components/plan/CashFlowPieChart";
import { PlanV2Header } from "@/components/plan-v2/PlanV2Header";
import { SectionEditor } from "@/components/plan-v2/SectionEditor";
import { SectionRenderer } from "@/components/plan-v2/SectionRenderer";
import { BenchmarkChart } from "@/components/plan-v2/BenchmarkChart";
import { getBenchmarkTargetForAge } from "@/lib/benchmarkTargets";
import {
  createDefaultFinancialPlanV2,
  mergeFinancialPlanV2,
  type FinancialPlanV2Document,
} from "@/types/financialPlanV2";

interface FinancialPlanRow {
  id: string;
  user_id: string;
  content: unknown;
}

interface AccountBalance {
  account_type: string;
  balance: number;
  savings_amount: number | null;
}

interface CashFlowItem {
  amount: number;
  flow_type: "inflow" | "outflow";
  frequency: string;
  outflow_category: string | null;
}

interface PlanDerivedMetrics {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidSavings: number;
  annualIncome: number;
  annualOutflow: number;
  annualSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
  savingsRatio: number;
  allocationChart: Array<{ label: string; amount: number; chartColor: string }>;
}

const toAnnual = (amount: number, frequency?: string | null): number => {
  switch (frequency) {
    case "weekly":
      return amount * 52;
    case "bi-weekly":
      return amount * 26;
    case "monthly":
      return amount * 12;
    case "quarterly":
      return amount * 4;
    case "annual":
      return amount;
    default:
      return amount * 12;
  }
};

const currency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const PlanV2 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewAsUserId = searchParams.get("viewAs");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [displayUserId, setDisplayUserId] = useState("");
  const [displayUserName, setDisplayUserName] = useState("Client");
  const [plan, setPlan] = useState<FinancialPlanV2Document>(createDefaultFinancialPlanV2());
  const [metrics, setMetrics] = useState<PlanDerivedMetrics>({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    liquidSavings: 0,
    annualIncome: 0,
    annualOutflow: 0,
    annualSavings: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyNet: 0,
    savingsRatio: 0,
    allocationChart: [],
  });

  useEffect(() => {
    loadAll();
  }, [viewAsUserId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        navigate("/");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      const admin = !!roleData;
      setIsSuperAdmin(admin);

      let userIdToDisplay = session.user.id;
      if (viewAsUserId && admin) {
        userIdToDisplay = viewAsUserId;
      }
      setDisplayUserId(userIdToDisplay);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", userIdToDisplay)
        .maybeSingle();

      setDisplayUserName(profileData?.full_name || profileData?.email || "Client");

      const { data: planRow, error: planError } = await supabase
        .from("financial_plans")
        .select("id, user_id, content")
        .eq("user_id", userIdToDisplay)
        .maybeSingle();

      if (planError && planError.code !== "PGRST116") throw planError;
      setPlan(
        mergeFinancialPlanV2((planRow as FinancialPlanRow | null)?.content, profileData?.full_name || profileData?.email || "Client"),
      );

      await loadDerivedMetrics(userIdToDisplay);
    } catch (error) {
      secureLogger.error(error, "PlanV2 load", "Failed to load plan");
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const loadDerivedMetrics = async (userId: string) => {
    try {
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("account_type, balance, savings_amount")
        .eq("user_id", userId);

      if (accountsError) throw accountsError;

      const { data: cashFlowItems, error: cashError } = await supabase
        .from("cash_flow_items")
        .select("amount, flow_type, frequency, outflow_category")
        .eq("user_id", userId);

      if (cashError) throw cashError;

      const assetTypes = new Set([
        "checking_account",
        "savings_account",
        "brokerage_account",
        "ira",
        "roth_ira",
        "traditional_401k",
        "roth_401k",
        "primary_residence",
        "rental_property",
        "business",
        "other_asset",
      ]);

      const liabilityTypes = new Set(["credit_card", "student_loan", "mortgage", "auto_loan", "other_loan"]);

      const accountData = (accounts || []) as AccountBalance[];
      const cashData = (cashFlowItems || []) as CashFlowItem[];

      const totalAssets = accountData
        .filter((account) => assetTypes.has(account.account_type))
        .reduce((sum, account) => sum + Number(account.balance || 0), 0);
      const totalLiabilities = accountData
        .filter((account) => liabilityTypes.has(account.account_type))
        .reduce((sum, account) => sum + Number(account.balance || 0), 0);

      const liquidSavings = accountData
        .filter((account) => account.account_type === "checking_account" || account.account_type === "savings_account")
        .reduce((sum, account) => sum + Number(account.balance || 0), 0);

      const annualIncome = cashData
        .filter((item) => item.flow_type === "inflow")
        .reduce((sum, item) => sum + toAnnual(Number(item.amount || 0), item.frequency), 0);
      const annualOutflow = cashData
        .filter((item) => item.flow_type === "outflow")
        .reduce((sum, item) => sum + toAnnual(Number(item.amount || 0), item.frequency), 0);
      const annualSavings = cashData
        .filter((item) => item.flow_type === "outflow" && item.outflow_category === "savings")
        .reduce((sum, item) => sum + toAnnual(Number(item.amount || 0), item.frequency), 0);
      const annualExpenses = annualOutflow - annualSavings;

      const monthlyIncome = annualIncome / 12;
      const monthlyExpenses = annualExpenses / 12;
      const monthlyNet = monthlyIncome - annualOutflow / 12;
      const savingsRatio = annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0;

      const allocationChart = [
        { label: "Savings", amount: annualSavings, chartColor: "#34D399" },
        { label: "Expenses", amount: Math.max(0, annualExpenses), chartColor: "#F87171" },
        { label: "Available", amount: Math.max(0, annualIncome - annualOutflow), chartColor: "#38BDF8" },
      ].filter((item) => item.amount > 0);

      setMetrics({
        totalAssets,
        totalLiabilities,
        netWorth: totalAssets - totalLiabilities,
        liquidSavings,
        annualIncome,
        annualOutflow,
        annualSavings,
        monthlyIncome,
        monthlyExpenses,
        monthlyNet,
        savingsRatio,
        allocationChart,
      });
    } catch (error) {
      secureLogger.error(error, "PlanV2 metrics", "Failed to calculate derived metrics");
    }
  };

  const handleSave = async () => {
    if (!displayUserId) return;
    setSaving(true);
    try {
      const nextPlan = {
        ...plan,
        updatedAt: new Date().toISOString(),
      };
      setPlan(nextPlan);

      const { error } = await supabase.from("financial_plans").upsert(
        {
          user_id: displayUserId,
          content: nextPlan,
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;
      toast.success("Financial plan saved");
    } catch (error: any) {
      secureLogger.error(error, "PlanV2 save", "Failed to save plan");
      toast.error(error?.message || "Failed to save financial plan");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (viewAsUserId && isSuperAdmin) {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const benchmarkTarget = useMemo(
    () => getBenchmarkTargetForAge(plan.clientProfile.clientAge),
    [plan.clientProfile.clientAge],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="plan-v2-root min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <PlanV2Header
        title={viewAsUserId && isSuperAdmin ? `${displayUserName}'s Plan V2` : "Your Financial Plan V2"}
        isEditMode={isEditMode}
        onBack={handleBack}
        onToggleMode={() => setIsEditMode((prev) => !prev)}
        onSave={handleSave}
        onPrint={() => window.print()}
        saving={saving}
        showAdminButton={isSuperAdmin}
        onAdminNavigate={() => navigate("/admin")}
        onHomeNavigate={() => navigate("/home")}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-10">
        <section className="mb-8 grid gap-4 md:grid-cols-4 plan-v2-print-section">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/70">Net Worth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-heading text-white">{currency(metrics.netWorth)}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/70">Savings Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-heading text-white">{metrics.savingsRatio.toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/70">Monthly Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-heading text-white">{currency(metrics.monthlyIncome)}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/70">Monthly Net</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-heading text-white">{currency(metrics.monthlyNet)}</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/5 text-white plan-v2-print-section">
            <CardHeader>
              <CardTitle className="text-white">Cash Flow Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.annualIncome > 0 ? (
                <CashFlowPieChart
                  data={metrics.allocationChart}
                  totalLabel="Annual Income"
                  inflowTotal={metrics.annualIncome}
                />
              ) : (
                <p className="text-white/65">Add cash flow data to visualize your allocation plan.</p>
              )}
            </CardContent>
          </Card>
          <BenchmarkChart
            age={plan.clientProfile.clientAge}
            target={benchmarkTarget}
            annualIncome={metrics.annualIncome}
            netWorth={metrics.netWorth}
            liquidSavings={metrics.liquidSavings}
            monthlyExpenses={metrics.monthlyExpenses}
          />
        </section>

        {isEditMode ? (
          <SectionEditor plan={plan} onChange={setPlan} />
        ) : (
          <SectionRenderer plan={plan} clientName={displayUserName} />
        )}
      </main>
    </div>
  );
};

export default PlanV2;
