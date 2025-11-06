import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { secureLogger } from "@/lib/secureLogger";
import { ArrowLeft, ArrowRight, PiggyBank, Shield, Landmark, Scale, BadgeCheck } from "lucide-react";
import { CashFlowPieChart } from "@/components/plan/CashFlowPieChart";

const cashFlowVisualization = [
  { label: "Gross Salary", amount: 185_000, color: "from-primary/80 to-secondary/70", chartColor: "#6366F1" },
  { label: "Tax Payments", amount: 45_820, color: "from-rose-500/80 to-orange-400/70", chartColor: "#F87171" },
  { label: "Savings & Investments", amount: 38_000, color: "from-emerald-400/80 to-teal-300/70", chartColor: "#34D399" },
  { label: "Lifestyle Spending", amount: 74_000, color: "from-sky-400/80 to-cyan-300/70", chartColor: "#38BDF8" },
  { label: "Leftover Cash", amount: 27_180, color: "from-violet-400/80 to-indigo-300/70", chartColor: "#A855F7" },
];

const investmentAccounts = [
  {
    name: "401(k) - Employer Plan",
    balance: 146_250,
    allocation: "70% equities | 20% bonds | 10% alternatives",
    recommendation: "Increase pre-tax contribution from 8% to 10% and capture full employer match.",
  },
  {
    name: "Roth IRA",
    balance: 62_800,
    allocation: "90% equities | 10% cash",
    recommendation: "Automate $500 monthly contribution and rebalance to 80/20 equity/bond split.",
  },
  {
    name: "Taxable Brokerage",
    balance: 89_430,
    allocation: "Global equity tilt with ESG overlay",
    recommendation: "Deploy $1,000 monthly toward goal-based bucket; harvest losses opportunistically.",
  },
];

const insuranceRecommendations = [
  {
    title: "Life Insurance",
    summary: "Add $1M 20-year term policy to replace income and cover mortgage payoff.",
    details: [
      "Current employer coverage equals 1x salary; target coverage is 8x salary.",
      "Run quotes with existing broker and online marketplaces.",
    ],
  },
  {
    title: "Disability Insurance",
    summary: "Supplement employer policy with an individual long-term policy (60% income replacement).",
    details: [
      "Coordinate elimination period with emergency fund (6 months).",
      "Explore portability options in case of job change.",
    ],
  },
  {
    title: "Property & Casualty",
    summary: "Raise liability protection with $1M umbrella policy.",
    details: [
      "Bundle with auto/home to capture multi-policy discount.",
      "Review dwelling coverage; current limit is below replacement cost.",
    ],
  },
];

const taxPlanning = [
  {
    title: "Maximize Tax-Advantaged Space",
    bullets: [
      "Increase 401(k) deferral to reach annual IRS limit by year end.",
      "Execute backdoor Roth contributions for both spouses.",
    ],
  },
  {
    title: "Strategic Charitable Gifting",
    bullets: [
      "Aggregate two years of giving via donor-advised fund to exceed standard deduction.",
      "Gift appreciated securities from taxable account to avoid capital gains.",
    ],
  },
  {
    title: "Ongoing Monitoring",
    bullets: [
      "Quarterly tax projection to dial in paycheck withholding.",
      "Document RSU/ISO events in shared tracker for CPA coordination.",
    ],
  },
];

const estatePlanning = [
  {
    title: "Core Documents",
    body: "Update wills, durable powers of attorney, and healthcare directives to reflect relocation and new dependents.",
  },
  {
    title: "Trust Structure",
    body: "Implement revocable living trust for probate avoidance and include testamentary trusts for minor beneficiaries.",
  },
  {
    title: "Beneficiary Coordination",
    body: "Align insurance policies and retirement accounts with estate plan; add per stirpes designations.",
  },
  {
    title: "Digital Asset Catalog",
    body: "Create secure inventory of passwords, crypto wallets, and key documents for executor access.",
  },
];

const numberFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const Plan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewAsUserId = searchParams.get("viewAs");
  
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [displayUserId, setDisplayUserId] = useState<string>("");
  const [displayUserName, setDisplayUserName] = useState<string>("");

  useEffect(() => {
    checkAccess();
  }, [viewAsUserId]);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/");
        return;
      }

      // Check if user is super admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      const isAdmin = !!roleData;
      setIsSuperAdmin(isAdmin);

      // Determine which user's data to display
      let userIdToDisplay = session.user.id;
      
      if (viewAsUserId && isAdmin) {
        userIdToDisplay = viewAsUserId;
      }

      setDisplayUserId(userIdToDisplay);

      // Fetch user profile for display name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", userIdToDisplay)
        .maybeSingle();

      if (profileData) {
        setDisplayUserName(profileData.full_name || profileData.email);
      }
    } catch (error) {
      secureLogger.error(error, 'Plan access check', 'Failed to verify access');
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleBack = () => {
    if (viewAsUserId && isSuperAdmin) {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  const clientName = displayUserName || "Client";
  const inflowTotal =
    cashFlowVisualization.find((slice) => slice.label === "Gross Salary")?.amount ?? 0;
  const cashOutflowSlices = cashFlowVisualization
    .filter((slice) => slice.label !== "Gross Salary")
    .map((slice) => ({ ...slice, amount: Number(slice.amount) }));

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Financial Plan</p>
              <h1 className="text-2xl font-heading font-semibold text-white">
                {viewAsUserId && isSuperAdmin ? `${displayUserName}'s Plan` : "Your Financial Plan"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Admin Dashboard
              </Button>
            )}
            <Button
              onClick={() => navigate("/home")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Home
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-[0_20px_45px_-20px_rgba(99,102,241,0.8)] transition-transform hover:scale-[1.03]"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Comprehensive Plan</p>
              <h2 className="mt-2 text-4xl font-heading font-semibold text-white md:text-5xl">
                Give each dollar a job
              </h2>
              <p className="mt-4 max-w-3xl text-white/70">
                This sample plan illustrates how today&apos;s cash flow fuels long-term goals, investment discipline,
                risk management, and legacy priorities. Use it as a blueprint while customizing the numbers to {clientName}.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-white/70">
              <p className="font-semibold text-white">Plan snapshot</p>
              <p>Prepared for: {clientName}</p>
              <p>Advisor: Wealthflow Demo</p>
              <p>Plan Horizon: 2025 – 2030</p>
            </div>
          </div>

          <Card className="border-white/10 bg-white/5 text-white backdrop-blur-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ArrowRight className="h-5 w-5 text-primary" />
                Cash in motion
              </CardTitle>
              <CardDescription className="text-white/60">
                Illustrative view of how current salary flows through taxes, savings, lifestyle spending, and surplus cash.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-5">
                {cashFlowVisualization.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-[0_20px_40px_-30px_rgba(59,130,246,0.45)]"
                  >
                    <div className={`mx-auto mb-4 h-2 w-16 rounded-full bg-gradient-to-r ${item.color}`} />
                    <p className="text-xs uppercase tracking-wide text-white/60">{item.label}</p>
                    <p className="mt-2 text-lg font-heading font-semibold text-white">
                      {numberFormatter.format(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/60">
                Action trigger: update allocations quarterly or whenever a major life change occurs to keep dollars aligned with goals.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white backdrop-blur-2xl">
            <CardHeader>
              <CardTitle className="text-white">Cash outflow allocation</CardTitle>
              <CardDescription className="text-white/60">
                Each slice shows the percentage of income flowing to taxes, savings, lifestyle, and surplus cash.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CashFlowPieChart
                data={cashOutflowSlices}
                totalLabel="Annual Income"
                inflowTotal={inflowTotal}
              />
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 space-y-6">
          <h3 className="flex items-center gap-2 text-2xl font-heading font-semibold text-white">
            <PiggyBank className="h-6 w-6 text-emerald-400" />
            Investment accounts & recommendations
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {investmentAccounts.map((account) => (
              <Card key={account.name} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{account.name}</CardTitle>
                  <CardDescription className="text-white/60">
                    Balance: {numberFormatter.format(account.balance)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                    <p className="uppercase tracking-wide text-white/50">Current Allocation</p>
                    <p className="mt-1 text-white">{account.allocation}</p>
                  </div>
                  <div className="flex gap-3 rounded-xl border border-white/10 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent px-4 py-3 text-sm">
                    <BadgeCheck className="h-5 w-5 text-primary" />
                    <p>{account.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <h3 className="flex items-center gap-2 text-2xl font-heading font-semibold text-white">
            <Shield className="h-6 w-6 text-sky-400" />
            Insurance recommendations
          </h3>
          <div className="grid gap-6 lg:grid-cols-3">
            {insuranceRecommendations.map((item) => (
              <Card key={item.title} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{item.title}</CardTitle>
                  <CardDescription className="text-white/60">{item.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-white/70">
                    {item.details.map((detail) => (
                      <li key={detail} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <h3 className="flex items-center gap-2 text-2xl font-heading font-semibold text-white">
            <Landmark className="h-6 w-6 text-amber-300" />
            Tax planning focus areas
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {taxPlanning.map((item) => (
              <Card key={item.title} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-white/70">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-amber-300" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <h3 className="flex items-center gap-2 text-2xl font-heading font-semibold text-white">
            <Scale className="h-6 w-6 text-violet-300" />
            Estate planning next steps
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {estatePlanning.map((item) => (
              <Card key={item.title} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/70">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Plan;
