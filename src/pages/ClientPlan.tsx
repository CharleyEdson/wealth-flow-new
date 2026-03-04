import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit3, Eye, Printer, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { secureLogger } from "@/lib/secureLogger";
import { resolveComponentData, resolveDerivedPlanData, type DerivedPlanData } from "@/lib/planDataResolvers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { ClientFinancialPlanSnapshot, SnapshotComponent, SnapshotPage } from "@/types/templateSystem";

const db = supabase as any;

const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const parseList = (value: unknown): string[] => {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};

const renderComponentInstance = (component: SnapshotComponent, derivedData: DerivedPlanData) => {
  const resolved = resolveComponentData(component.componentKey, derivedData, component.manualData || {});
  const data = resolved.merged;

  switch (component.componentKey) {
    case "ratios":
      return (
        <Card key={component.id} className="border-white/10 bg-white/5 plan-v2-print-section">
          <CardHeader>
            <CardTitle>{component.displayName}</CardTitle>
            <CardDescription>Auto-derived ratio indicators</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/55">Savings Ratio</p>
              <p className="text-2xl font-heading">{Number(data.savingsRatio || 0).toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/55">Monthly Income</p>
              <p className="text-2xl font-heading">{money(Number(data.monthlyIncome || 0))}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/55">Monthly Net</p>
              <p className="text-2xl font-heading">{money(Number(data.monthlyNet || 0))}</p>
            </div>
          </CardContent>
        </Card>
      );
    case "tax_allocation":
      return (
        <Card key={component.id} className="border-white/10 bg-white/5 plan-v2-print-section">
          <CardHeader>
            <CardTitle>{component.displayName}</CardTitle>
            <CardDescription>Auto annual values with advisor notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Annual Income: <strong>{money(Number(data.annualIncome || 0))}</strong></p>
            <p>Annual Savings: <strong>{money(Number(data.annualSavings || 0))}</strong></p>
            <p>Annual Outflow: <strong>{money(Number(data.annualOutflow || 0))}</strong></p>
            {data.recommendations && <p className="text-sm text-white/70">{String(data.recommendations)}</p>}
          </CardContent>
        </Card>
      );
    case "portfolio_optimization":
      return (
        <Card key={component.id} className="border-white/10 bg-white/5 plan-v2-print-section">
          <CardHeader>
            <CardTitle>{component.displayName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Net Worth: <strong>{money(Number(data.netWorth || 0))}</strong></p>
            <p>Total Assets: <strong>{money(Number(data.totalAssets || 0))}</strong></p>
            <p>Total Liabilities: <strong>{money(Number(data.totalLiabilities || 0))}</strong></p>
            {data.allocationNotes && <p className="text-sm text-white/70">{String(data.allocationNotes)}</p>}
          </CardContent>
        </Card>
      );
    case "cash_flow_allocation":
      return (
        <Card key={component.id} className="border-white/10 bg-white/5 plan-v2-print-section">
          <CardHeader>
            <CardTitle>{component.displayName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Annual Income: <strong>{money(Number(data.annualIncome || 0))}</strong></p>
            <p>Annual Savings: <strong>{money(Number(data.annualSavings || 0))}</strong></p>
            <p>Annual Outflow: <strong>{money(Number(data.annualOutflow || 0))}</strong></p>
            <p>Monthly Net: <strong>{money(Number(data.monthlyNet || 0))}</strong></p>
            {data.notes && <p className="text-sm text-white/70">{String(data.notes)}</p>}
          </CardContent>
        </Card>
      );
    case "account_consolidation":
      return (
        <Card key={component.id} className="border-white/10 bg-white/5 plan-v2-print-section">
          <CardHeader>
            <CardTitle>{component.displayName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Connected Accounts: <strong>{Number(data.accountCount || 0)}</strong></p>
            <p>Total Assets: <strong>{money(Number(data.totalAssets || 0))}</strong></p>
            <p>Total Liabilities: <strong>{money(Number(data.totalLiabilities || 0))}</strong></p>
            {data.actions && <p className="text-sm text-white/70">{String(data.actions)}</p>}
          </CardContent>
        </Card>
      );
    case "goal_list":
      return (
        <Card key={component.id} className="border-white/10 bg-white/5 plan-v2-print-section">
          <CardHeader>
            <CardTitle>{component.displayName}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {parseList(data.goals).map((goal, index) => (
                <li key={`${component.id}-goal-${index}`} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );
    case "implementation_phase":
      return (
        <Card key={component.id} className="border-white/10 bg-white/5 plan-v2-print-section">
          <CardHeader>
            <CardTitle>{String(data.phaseTitle || component.displayName)}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {parseList(data.actions).map((action, index) => (
                <li key={`${component.id}-action-${index}`} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );
    case "text_block":
    default:
      return (
        <Card key={component.id} className="border-white/10 bg-white/5 plan-v2-print-section">
          <CardHeader>
            <CardTitle>{String(data.title || component.displayName)}</CardTitle>
          </CardHeader>
          <CardContent className="whitespace-pre-wrap text-white/75">{String(data.body || "")}</CardContent>
        </Card>
      );
  }
};

const ClientPlan = () => {
  const { clientPlanId } = useParams<{ clientPlanId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [clientPlan, setClientPlan] = useState<ClientFinancialPlanSnapshot | null>(null);
  const [derivedData, setDerivedData] = useState<DerivedPlanData | null>(null);

  useEffect(() => {
    bootstrap();
  }, [clientPlanId]);

  const bootstrap = async () => {
    if (!clientPlanId) return;
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        navigate("/");
        return;
      }

      const { data, error } = await db.from("client_financial_plans").select("*").eq("id", clientPlanId).single();
      if (error) throw error;
      const row = data as ClientFinancialPlanSnapshot;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      if (!roleData && row.user_id !== session.user.id) {
        toast.error("Access denied");
        navigate("/home");
        return;
      }

      setClientPlan(row);
      const derived = await resolveDerivedPlanData(row.user_id);
      setDerivedData(derived);
    } catch (error) {
      secureLogger.error(error, "Client plan bootstrap", "Failed to load client plan");
      navigate("/plan-templates");
    } finally {
      setLoading(false);
    }
  };

  const pages = useMemo(() => {
    const content = clientPlan?.content;
    const pageList = content?.pages || [];
    return [...pageList].sort((a: SnapshotPage, b: SnapshotPage) => a.pageNumber - b.pageNumber);
  }, [clientPlan]);

  const updateManualData = (pageId: string, componentId: string, value: string) => {
    if (!clientPlan) return;
    const updatedPages = pages.map((page: SnapshotPage) => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        components: page.components.map((component) => {
          if (component.id !== componentId) return component;
          return {
            ...component,
            manualData: {
              ...component.manualData,
              body: value,
            },
          };
        }),
      };
    });

    setClientPlan({
      ...clientPlan,
      content: {
        ...clientPlan.content,
        pages: updatedPages,
      },
    });
  };

  const savePlan = async () => {
    if (!clientPlan) return;
    setSaving(true);
    try {
      const { error } = await db
        .from("client_financial_plans")
        .update({ content: clientPlan.content })
        .eq("id", clientPlan.id);
      if (error) throw error;
      toast.success("Client plan saved");
    } catch (error: any) {
      secureLogger.error(error, "Save client plan", "Failed to save client plan");
      toast.error(error?.message || "Failed to save client plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !clientPlan || !derivedData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading client plan...</p>
      </div>
    );
  }

  return (
    <div className="plan-v2-root min-h-screen">
      <header className="plan-v2-no-print border-b border-white/10 bg-white/5">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Client Snapshot Plan</p>
            <h1 className="text-2xl font-heading">{clientPlan.content.template.name}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditMode((prev) => !prev)}>
              {editMode ? <Eye className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
              {editMode ? "Presentation" : "Edit"}
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Print PDF
            </Button>
            <Button onClick={savePlan} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/plan-templates")}>
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-8 px-4 py-8">
        {pages.map((page: SnapshotPage) => (
          <section key={page.id} className="space-y-4 plan-v2-print-section">
            <h2 className="text-2xl font-heading">
              Page {page.pageNumber}: {page.title}
            </h2>
            {page.components
              .filter((component) => component.visible)
              .sort((a, b) => a.position - b.position)
              .map((component) => (
                <div key={component.id}>
                  {renderComponentInstance(component, derivedData)}
                  {editMode && (
                    <Card className="plan-v2-no-print mt-2 border-white/10 bg-white/5">
                      <CardHeader>
                        <CardTitle className="text-base">Manual Override</CardTitle>
                        <CardDescription>Quick note/editor for this component instance.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          rows={4}
                          value={String(component.manualData?.body || "")}
                          onChange={(e) => updateManualData(page.id, component.id, e.target.value)}
                          placeholder="Manual override or narrative..."
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
          </section>
        ))}
      </main>
    </div>
  );
};

export default ClientPlan;
