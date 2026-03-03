import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type {
  FinancialPlanV2Document,
  PlanCashBucket,
  PlanPhase,
  PlanSectionKey,
} from "@/types/financialPlanV2";

interface SectionEditorProps {
  plan: FinancialPlanV2Document;
  onChange: (plan: FinancialPlanV2Document) => void;
}

const sectionTitles: Record<PlanSectionKey, string> = {
  statement: "Statement + Goals",
  cashFlow: "Cash Flow Plan",
  investment: "Investment Recommendations",
  tax: "Tax Planning",
  insurance: "Insurance Planning",
  estate: "Estate Planning",
  summary: "Summary + Implementation Phases",
};

const updateArrayItem = <T,>(arr: T[], index: number, value: T) => arr.map((item, i) => (i === index ? value : item));

const makeId = () => Math.random().toString(36).slice(2, 10);

export const SectionEditor = ({ plan, onChange }: SectionEditorProps) => {
  const toggleVisibility = (key: PlanSectionKey) => {
    onChange({
      ...plan,
      visibility: {
        ...plan.visibility,
        [key]: !plan.visibility[key],
      },
    });
  };

  const updatePlan = (next: Partial<FinancialPlanV2Document>) => {
    onChange({
      ...plan,
      ...next,
      updatedAt: new Date().toISOString(),
    });
  };

  const listEditor = (
    title: string,
    values: string[],
    onValuesChange: (next: string[]) => void,
    placeholder: string,
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-white/70">{title}</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
          onClick={() => onValuesChange([...values, ""])}
        >
          <Plus className="mr-2 h-3 w-3" />
          Add
        </Button>
      </div>
      {values.map((value, index) => (
        <div key={`${title}-${index}`} className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onValuesChange(updateArrayItem(values, index, e.target.value))}
            placeholder={placeholder}
            className="border-white/15 bg-white/10 text-white placeholder:text-white/50"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-white/60 hover:text-white"
            onClick={() => onValuesChange(values.filter((_, i) => i !== index))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  const renderCard = (
    key: PlanSectionKey,
    description: string,
    content: ReactNode,
  ) => (
    <Card key={key} className="border-white/10 bg-white/5 text-white">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-white">{sectionTitles[key]}</CardTitle>
            <CardDescription className="text-white/60">{description}</CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => toggleVisibility(key)}
          >
            {plan.visibility[key] ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{content}</CardContent>
    </Card>
  );

  const addBucket = () => {
    updatePlan({
      cashFlow: {
        ...plan.cashFlow,
        buckets: [
          ...plan.cashFlow.buckets,
          {
            id: makeId(),
            title: "New Bucket",
            targetAmount: "",
            monthlyContribution: "",
            recommendation: "",
          },
        ],
      },
    });
  };

  const updateBucket = (index: number, bucket: PlanCashBucket) => {
    updatePlan({
      cashFlow: {
        ...plan.cashFlow,
        buckets: updateArrayItem(plan.cashFlow.buckets, index, bucket),
      },
    });
  };

  const removeBucket = (index: number) => {
    updatePlan({
      cashFlow: {
        ...plan.cashFlow,
        buckets: plan.cashFlow.buckets.filter((_, i) => i !== index),
      },
    });
  };

  const addPhase = () => {
    updatePlan({
      summary: {
        ...plan.summary,
        phases: [...plan.summary.phases, { id: makeId(), title: "New Phase", actions: [""] }],
      },
    });
  };

  const updatePhase = (index: number, phase: PlanPhase) => {
    updatePlan({
      summary: {
        ...plan.summary,
        phases: updateArrayItem(plan.summary.phases, index, phase),
      },
    });
  };

  const removePhase = (index: number) => {
    updatePlan({
      summary: {
        ...plan.summary,
        phases: plan.summary.phases.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-white">Plan Meta</CardTitle>
          <CardDescription className="text-white/60">
            Profile and planning assumptions used for visuals and benchmarking.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="advisor-name" className="text-white/70">
              Advisor Name
            </Label>
            <Input
              id="advisor-name"
              value={plan.clientProfile.advisorName}
              onChange={(e) =>
                updatePlan({
                  clientProfile: { ...plan.clientProfile, advisorName: e.target.value },
                })
              }
              className="border-white/15 bg-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-age" className="text-white/70">
              Client Age
            </Label>
            <Input
              id="client-age"
              type="number"
              min={18}
              max={100}
              value={plan.clientProfile.clientAge ?? ""}
              onChange={(e) =>
                updatePlan({
                  clientProfile: {
                    ...plan.clientProfile,
                    clientAge: e.target.value ? Number(e.target.value) : null,
                  },
                })
              }
              className="border-white/15 bg-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-horizon" className="text-white/70">
              Plan Horizon
            </Label>
            <Input
              id="plan-horizon"
              value={plan.clientProfile.planHorizon}
              onChange={(e) =>
                updatePlan({
                  clientProfile: { ...plan.clientProfile, planHorizon: e.target.value },
                })
              }
              className="border-white/15 bg-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {renderCard(
        "statement",
        "Define purpose and top goals.",
        <>
          <div className="space-y-2">
            <Label className="text-white/70">Statement of Financial Purpose</Label>
            <Textarea
              value={plan.statement.purpose}
              onChange={(e) => updatePlan({ statement: { ...plan.statement, purpose: e.target.value } })}
              rows={4}
              className="border-white/15 bg-white/10 text-white"
            />
          </div>
          {listEditor("Goals", plan.statement.goals, (goals) => updatePlan({ statement: { ...plan.statement, goals } }), "Enter goal")}
        </>,
      )}

      {renderCard(
        "cashFlow",
        "Cash flow rules, savings buckets, and debt notes.",
        <>
          <div className="space-y-2">
            <Label className="text-white/70">Cash Flow Overview</Label>
            <Textarea
              rows={3}
              value={plan.cashFlow.overview}
              onChange={(e) => updatePlan({ cashFlow: { ...plan.cashFlow, overview: e.target.value } })}
              className="border-white/15 bg-white/10 text-white"
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white/70">Cash Buckets</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={addBucket}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add Bucket
              </Button>
            </div>
            {plan.cashFlow.buckets.map((bucket, index) => (
              <div key={bucket.id} className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <Input
                    value={bucket.title}
                    onChange={(e) => updateBucket(index, { ...bucket, title: e.target.value })}
                    placeholder="Bucket Name"
                    className="border-white/15 bg-white/10 text-white"
                  />
                  <Input
                    value={bucket.targetAmount}
                    onChange={(e) => updateBucket(index, { ...bucket, targetAmount: e.target.value })}
                    placeholder="Target Amount"
                    className="border-white/15 bg-white/10 text-white"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={bucket.monthlyContribution}
                      onChange={(e) => updateBucket(index, { ...bucket, monthlyContribution: e.target.value })}
                      placeholder="Monthly Contribution"
                      className="border-white/15 bg-white/10 text-white"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-white/60 hover:text-white"
                      onClick={() => removeBucket(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  rows={2}
                  value={bucket.recommendation}
                  onChange={(e) => updateBucket(index, { ...bucket, recommendation: e.target.value })}
                  placeholder="Recommendation details"
                  className="border-white/15 bg-white/10 text-white"
                />
              </div>
            ))}
          </div>
          {listEditor(
            "Debt Notes",
            plan.cashFlow.debtNotes,
            (debtNotes) => updatePlan({ cashFlow: { ...plan.cashFlow, debtNotes } }),
            "Debt review detail",
          )}
        </>,
      )}

      {renderCard(
        "investment",
        "Accounts and allocations to execute.",
        <>
          {listEditor(
            "Account Recommendations",
            plan.investment.accountRecommendations,
            (accountRecommendations) => updatePlan({ investment: { ...plan.investment, accountRecommendations } }),
            "Recommendation",
          )}
          {listEditor(
            "Allocation Notes",
            plan.investment.allocationNotes,
            (allocationNotes) => updatePlan({ investment: { ...plan.investment, allocationNotes } }),
            "Allocation note",
          )}
        </>,
      )}

      {renderCard(
        "tax",
        "Tax strategy recommendations.",
        listEditor(
          "Tax Recommendations",
          plan.tax.recommendations,
          (recommendations) => updatePlan({ tax: { recommendations } }),
          "Tax planning action",
        ),
      )}

      {renderCard(
        "insurance",
        "Coverage and policy recommendations.",
        listEditor(
          "Insurance Recommendations",
          plan.insurance.recommendations,
          (recommendations) => updatePlan({ insurance: { recommendations } }),
          "Insurance recommendation",
        ),
      )}

      {renderCard(
        "estate",
        "Estate planning recommendations.",
        listEditor(
          "Estate Recommendations",
          plan.estate.recommendations,
          (recommendations) => updatePlan({ estate: { recommendations } }),
          "Estate recommendation",
        ),
      )}

      {renderCard(
        "summary",
        "Summary narrative and implementation phases.",
        <>
          <div className="space-y-2">
            <Label className="text-white/70">Summary</Label>
            <Textarea
              rows={4}
              value={plan.summary.summaryText}
              onChange={(e) => updatePlan({ summary: { ...plan.summary, summaryText: e.target.value } })}
              className="border-white/15 bg-white/10 text-white"
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white/70">Implementation Phases</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={addPhase}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add Phase
              </Button>
            </div>
            {plan.summary.phases.map((phase, index) => (
              <div key={phase.id} className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex gap-2">
                  <Input
                    value={phase.title}
                    onChange={(e) => updatePhase(index, { ...phase, title: e.target.value })}
                    className="border-white/15 bg-white/10 text-white"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-white/60 hover:text-white"
                    onClick={() => removePhase(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {listEditor(
                  "Actions",
                  phase.actions,
                  (actions) => updatePhase(index, { ...phase, actions }),
                  "Action item",
                )}
              </div>
            ))}
          </div>
        </>,
      )}
    </div>
  );
};
import { ReactNode } from "react";
