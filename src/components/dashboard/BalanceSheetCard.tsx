import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AddAccountModal, type Account } from "./AddAccountModal";
import { Trash2, Pencil } from "lucide-react";
import { secureLogger } from "@/lib/secureLogger";
import { accountTypeLabels, type AccountType } from "@/lib/accountTypes";
import {
  defaultBucketByAccountType,
  financialBucketLabel,
  type FinancialBucket,
} from "@/lib/accountBuckets";

interface BalanceSheetCardProps {
  userId: string;
  isSuperAdmin: boolean;
}

const ASSET_BUCKET_ORDER: FinancialBucket[] = ["cash", "after_tax", "pre_tax", "real_estate", "business"];
const DEBT_TYPE_ORDER: AccountType[] = ["mortgage", "student_loan", "auto_loan", "credit_card", "other_loan"];

const currency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export const BalanceSheetCard = ({ userId, isSuperAdmin }: BalanceSheetCardProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);

  useEffect(() => {
    fetchAccounts();
  }, [userId]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, account_type, name, balance, savings_amount, financial_bucket")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAccounts(
        (data || []).map((account: any) => ({
          id: account.id,
          type: account.account_type as AccountType,
          name: account.name,
          balance: Number(account.balance || 0),
          savingsAmount: Number(account.savings_amount || 0),
          financialBucket: (account.financial_bucket || defaultBucketByAccountType[account.account_type as AccountType]) as FinancialBucket,
        })),
      );
    } catch (error) {
      secureLogger.error(error, "Fetch accounts", "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (account: Omit<Account, "id">) => {
    try {
      const isAsset = account.financialBucket !== "debt";
      const { error } = await supabase.from("accounts").insert({
        user_id: userId,
        account_type: account.type,
        name: account.name,
        balance: account.balance,
        category: isAsset ? "asset" : "liability",
        savings_amount: account.savingsAmount || 0,
        financial_bucket: account.financialBucket,
      });

      if (error) throw error;
      toast.success("Account added");
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.message || "Failed to add account");
    }
  };

  const handleEditAccount = async (account: Account) => {
    try {
      const isAsset = account.financialBucket !== "debt";
      const { error } = await supabase
        .from("accounts")
        .update({
          account_type: account.type,
          name: account.name,
          balance: account.balance,
          category: isAsset ? "asset" : "liability",
          savings_amount: account.savingsAmount || 0,
          financial_bucket: account.financialBucket,
        })
        .eq("id", account.id);

      if (error) throw error;

      toast.success("Account updated");
      setEditingAccount(undefined);
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.message || "Failed to update account");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase.from("accounts").delete().eq("id", accountId);
      if (error) throw error;
      toast.success("Account deleted");
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  const groupedAssets = useMemo(() => {
    const groups: Record<FinancialBucket, Account[]> = {
      cash: [],
      after_tax: [],
      pre_tax: [],
      real_estate: [],
      business: [],
      debt: [],
    };

    for (const account of accounts) {
      groups[account.financialBucket].push(account);
    }

    return groups;
  }, [accounts]);

  const groupedDebtsByType = useMemo(() => {
    const debtAccounts = groupedAssets.debt;
    return DEBT_TYPE_ORDER.map((type) => ({
      type,
      label: accountTypeLabels[type],
      accounts: debtAccounts.filter((account) => account.type === type),
    })).filter((group) => group.accounts.length > 0);
  }, [groupedAssets.debt]);

  const totalAssets = ASSET_BUCKET_ORDER.reduce(
    (sum, bucket) => sum + groupedAssets[bucket].reduce((bucketSum, account) => bucketSum + account.balance, 0),
    0,
  );
  const totalDebts = groupedAssets.debt.reduce((sum, account) => sum + account.balance, 0);
  const netWorth = totalAssets - totalDebts;

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-white">Balance Sheet</CardTitle>
          <CardDescription className="text-white/60">Loading your financial structure...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/60">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-white">Balance Sheet</CardTitle>
          <CardDescription className="text-white/60">Grouped by planning categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-8 xl:grid-cols-2">
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white">Assets</h3>
              {ASSET_BUCKET_ORDER.map((bucket) => {
                const rows = groupedAssets[bucket];
                if (rows.length === 0) return null;
                const subtotal = rows.reduce((sum, row) => sum + row.balance, 0);

                return (
                  <div key={bucket} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">{financialBucketLabel[bucket]}</h4>
                      <span className="text-sm font-semibold text-white">{currency(subtotal)}</span>
                    </div>
                    <div className="space-y-2">
                      {rows.map((asset) => (
                        <div key={asset.id} className="group flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                          <div>
                            <div className="text-sm text-white/60">{accountTypeLabels[asset.type]}</div>
                            <div className="font-medium text-white">{asset.name}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{currency(asset.balance)}</span>
                            {isSuperAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingAccount(asset);
                                    setModalOpen(true);
                                  }}
                                  className="h-8 w-8 p-0 opacity-0 text-white/60 hover:text-white group-hover:opacity-100"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAccount(asset.id)}
                                  className="h-8 w-8 p-0 opacity-0 text-white/60 hover:text-white group-hover:opacity-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-white">Debts</h3>
              {groupedDebtsByType.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">No debts recorded</div>
              ) : (
                groupedDebtsByType.map((group) => {
                  const subtotal = group.accounts.reduce((sum, row) => sum + row.balance, 0);
                  return (
                    <div key={group.type} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">{group.label}</h4>
                        <span className="text-sm font-semibold text-white">{currency(subtotal)}</span>
                      </div>
                      <div className="space-y-2">
                        {group.accounts.map((debt) => (
                          <div key={debt.id} className="group flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            <div className="font-medium text-white">{debt.name}</div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{currency(debt.balance)}</span>
                              {isSuperAdmin && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingAccount(debt);
                                      setModalOpen(true);
                                    }}
                                    className="h-8 w-8 p-0 opacity-0 text-white/60 hover:text-white group-hover:opacity-100"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteAccount(debt.id)}
                                    className="h-8 w-8 p-0 opacity-0 text-white/60 hover:text-white group-hover:opacity-100"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Total Assets</p>
              <p className="mt-2 text-2xl font-heading font-semibold text-white">{currency(totalAssets)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Total Debts</p>
              <p className="mt-2 text-2xl font-heading font-semibold text-white">{currency(totalDebts)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Net Worth</p>
              <p className="mt-2 text-3xl font-heading font-semibold text-white">{currency(netWorth)}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-white/60">Assets minus debts</p>
            </div>
          </div>

          {isSuperAdmin && (
            <Button
              onClick={() => {
                setEditingAccount(undefined);
                setModalOpen(true);
              }}
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-[0_20px_45px_-25px_rgba(99,102,241,0.7)] hover:scale-[1.01]"
            >
              Add Account
            </Button>
          )}
        </CardContent>
      </Card>

      <AddAccountModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingAccount(undefined);
        }}
        onAdd={handleAddAccount}
        editAccount={editingAccount}
        onEdit={handleEditAccount}
      />
    </>
  );
};
