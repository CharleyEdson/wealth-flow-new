import { BadgeCheck, Landmark, PiggyBank, Scale, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinancialPlanV2Document } from "@/types/financialPlanV2";

interface SectionRendererProps {
  plan: FinancialPlanV2Document;
  clientName: string;
}

export const SectionRenderer = ({ plan, clientName }: SectionRendererProps) => {
  return (
    <div className="space-y-10 plan-v2-presentation">
      {plan.visibility.statement && (
        <section className="space-y-4 plan-v2-print-section">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Statement of Financial Purpose</p>
          <h2 className="text-4xl font-heading text-white md:text-5xl">Financial plan for {clientName}</h2>
          <p className="max-w-4xl text-white/75">{plan.statement.purpose}</p>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-white">Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-2 pl-5 text-white/75">
                {plan.statement.goals.map((goal, index) => (
                  <li key={`goal-${index}`}>{goal}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>
      )}

      {plan.visibility.cashFlow && (
        <section className="space-y-4 plan-v2-print-section">
          <h3 className="flex items-center gap-2 text-2xl font-heading text-white">
            <PiggyBank className="h-6 w-6 text-emerald-400" />
            Cash Flow Plan
          </h3>
          <p className="text-white/75">{plan.cashFlow.overview}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {plan.cashFlow.buckets.map((bucket) => (
              <Card key={bucket.id} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{bucket.title}</CardTitle>
                  <CardDescription className="text-white/60">
                    Target: {bucket.targetAmount} | Monthly: {bucket.monthlyContribution}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-white/75">{bucket.recommendation}</CardContent>
              </Card>
            ))}
          </div>
          {plan.cashFlow.debtNotes.length > 0 && (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">Debt Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-white/75">
                  {plan.cashFlow.debtNotes.map((note, index) => (
                    <li key={`debt-note-${index}`} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/50" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {plan.visibility.investment && (
        <section className="space-y-4 plan-v2-print-section">
          <h3 className="flex items-center gap-2 text-2xl font-heading text-white">
            <BadgeCheck className="h-6 w-6 text-primary" />
            Investment Recommendations
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">Account Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-white/75">
                  {plan.investment.accountRecommendations.map((rec, index) => (
                    <li key={`invest-account-${index}`} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">Allocation Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-white/75">
                  {plan.investment.allocationNotes.map((note, index) => (
                    <li key={`alloc-note-${index}`} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-secondary" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {plan.visibility.tax && (
        <section className="space-y-4 plan-v2-print-section">
          <h3 className="flex items-center gap-2 text-2xl font-heading text-white">
            <Landmark className="h-6 w-6 text-amber-300" />
            Tax Planning Recommendations
          </h3>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardContent className="pt-6">
              <ul className="space-y-2 text-white/75">
                {plan.tax.recommendations.map((rec, index) => (
                  <li key={`tax-rec-${index}`} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-300" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {plan.visibility.insurance && (
        <section className="space-y-4 plan-v2-print-section">
          <h3 className="flex items-center gap-2 text-2xl font-heading text-white">
            <Shield className="h-6 w-6 text-sky-300" />
            Insurance Planning
          </h3>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardContent className="pt-6">
              <ul className="space-y-2 text-white/75">
                {plan.insurance.recommendations.map((rec, index) => (
                  <li key={`ins-rec-${index}`} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {plan.visibility.estate && (
        <section className="space-y-4 plan-v2-print-section">
          <h3 className="flex items-center gap-2 text-2xl font-heading text-white">
            <Scale className="h-6 w-6 text-violet-300" />
            Estate Planning
          </h3>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardContent className="pt-6">
              <ul className="space-y-2 text-white/75">
                {plan.estate.recommendations.map((rec, index) => (
                  <li key={`estate-rec-${index}`} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-300" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {plan.visibility.summary && (
        <section className="space-y-4 plan-v2-print-section">
          <h3 className="text-2xl font-heading text-white">Summary & Implementation Phases</h3>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardContent className="pt-6">
              <p className="text-white/75">{plan.summary.summaryText}</p>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-3">
            {plan.summary.phases.map((phase) => (
              <Card key={phase.id} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white">{phase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-white/75">
                    {phase.actions.map((action, index) => (
                      <li key={`${phase.id}-action-${index}`} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/60" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
