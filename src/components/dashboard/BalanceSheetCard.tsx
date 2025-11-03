import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AddAccountModal, Account, AccountType } from "./AddAccountModal";
import { Trash2 } from "lucide-react";
import { secureLogger } from "@/lib/secureLogger";

interface BalanceSheetCardProps {
  userId: string;
  isSuperAdmin: boolean;
}

export const BalanceSheetCard = ({ userId, isSuperAdmin }: BalanceSheetCardProps) => {
  const [assets, setAssets] = useState<Account[]>([]);
  const [liabilities, setLiabilities] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [userId]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const accountsData = data.map(account => ({
          id: account.id,
          type: account.account_type as AccountType,
          name: account.name,
          balance: Number(account.balance),
        }));

        setAssets(accountsData.filter(a => a.type in {
          checking_account: 1, savings_account: 1, brokerage_account: 1, ira: 1, roth_ira: 1,
          traditional_401k: 1, roth_401k: 1, primary_residence: 1, rental_property: 1, business: 1, other_asset: 1
        }));
        
        setLiabilities(accountsData.filter(a => a.type in {
          credit_card: 1, student_loan: 1, mortgage: 1, auto_loan: 1, other_loan: 1
        }));
      }
    } catch (error) {
      secureLogger.error(error, 'Fetch accounts', 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (account: Omit<Account, "id">) => {
    try {
      const isAsset = [
        "checking_account", "savings_account", "brokerage_account", "ira", "roth_ira",
        "traditional_401k", "roth_401k", "primary_residence", "rental_property", 
        "business", "other_asset"
      ].includes(account.type);

      const { error } = await supabase
        .from("accounts")
        .insert({
          user_id: userId,
          account_type: account.type,
          name: account.name,
          balance: account.balance,
          category: isAsset ? "asset" : "liability",
          savings_amount: account.savingsAmount || 0,
        });

      if (error) throw error;

      toast.success("Account added");
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.message || "Failed to add account");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;

      toast.success("Account deleted");
      fetchAccounts();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  const calculateTotal = (accounts: Account[]) => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      checking_account: "Checking Account",
      savings_account: "Savings Account",
      brokerage_account: "Brokerage Account",
      ira: "IRA",
      roth_ira: "Roth IRA",
      traditional_401k: "401(k)",
      roth_401k: "Roth 401(k)",
      primary_residence: "Primary Residence",
      rental_property: "Rental Property",
      business: "Business",
      other_asset: "Other Asset",
      credit_card: "Credit Card",
      student_loan: "Student Loan",
      mortgage: "Mortgage",
      auto_loan: "Auto Loan",
      other_loan: "Other Loan",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
          <CardDescription>Your assets and liabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Assets</h3>
                </div>
                {assets.length > 0 ? (
                  <ul className="space-y-2">
                    {assets.map((asset) => (
                      <li key={asset.id} className="flex items-center justify-between group">
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">
                            {getAccountTypeLabel(asset.type)}
                          </div>
                          <div className="font-medium">{asset.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${asset.balance.toLocaleString()}</span>
                          {isSuperAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAccount(asset.id)}
                              className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No assets recorded</p>
                )}
                <p className="mt-3 pt-3 border-t font-bold">
                  Total: ${calculateTotal(assets).toLocaleString()}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Liabilities</h3>
                </div>
                {liabilities.length > 0 ? (
                  <ul className="space-y-2">
                    {liabilities.map((liability) => (
                      <li key={liability.id} className="flex items-center justify-between group">
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground">
                            {getAccountTypeLabel(liability.type)}
                          </div>
                          <div className="font-medium">{liability.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${liability.balance.toLocaleString()}</span>
                          {isSuperAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAccount(liability.id)}
                              className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No liabilities recorded</p>
                )}
                <p className="mt-3 pt-3 border-t font-bold">
                  Total: ${calculateTotal(liabilities).toLocaleString()}
                </p>
              </div>
            </div>
            
            {isSuperAdmin && (
              <Button onClick={() => setModalOpen(true)}>Add Account</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AddAccountModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAdd={handleAddAccount}
      />
    </>
  );
};
