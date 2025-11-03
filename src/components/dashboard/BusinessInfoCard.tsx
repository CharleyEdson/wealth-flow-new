import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { secureLogger } from "@/lib/secureLogger";

interface BusinessInfoCardProps {
  userId: string;
  isSuperAdmin: boolean;
}

export const BusinessInfoCard = ({ userId, isSuperAdmin }: BusinessInfoCardProps) => {
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [information, setInformation] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessInfo();
  }, [userId]);

  const fetchBusinessInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("business_information")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setBusinessInfo(data);
        setInformation(JSON.stringify(data.information, null, 2));
      }
    } catch (error) {
      secureLogger.error(error, 'Fetch business info', 'Failed to load business information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isSuperAdmin) {
      toast.error("Only super admins can edit business information");
      return;
    }

    try {
      let parsedInfo;
      try {
        parsedInfo = JSON.parse(information);
      } catch (e) {
        toast.error("Invalid JSON format");
        return;
      }

      if (businessInfo) {
        const { error } = await supabase
          .from("business_information")
          .update({ information: parsedInfo })
          .eq("id", businessInfo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("business_information")
          .insert({ user_id: userId, information: parsedInfo });

        if (error) throw error;
      }

      toast.success("Business information saved successfully");
      setEditing(false);
      fetchBusinessInfo();
    } catch (error: any) {
      toast.error(error.message || "Failed to save business information");
    }
  };

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-white">Key Business Information</CardTitle>
          <CardDescription className="text-white/60">
            Important metrics coming online...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/60">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader>
        <CardTitle className="text-white">Key Business Information</CardTitle>
        <CardDescription className="text-white/60">
          Important business metrics and details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <Textarea
              value={information}
              onChange={(e) => setInformation(e.target.value)}
              rows={8}
              placeholder='{"revenue": 100000, "expenses": 50000}'
              className="border-white/10 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/40"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-[0_20px_45px_-25px_rgba(99,102,241,0.7)] hover:scale-[1.01]"
              >
                Save
              </Button>
              <Button
                onClick={() => setEditing(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {businessInfo?.information && Object.keys(businessInfo.information).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(businessInfo.information).map(([key, value]: [string, any]) => (
                  <li
                    key={key}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="capitalize font-medium text-white">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-white/70">
                      {typeof value === "number" ? `$${value.toLocaleString()}` : value}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/60">No business information recorded</p>
            )}
            {isSuperAdmin && (
              <Button
                onClick={() => setEditing(true)}
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-[0_20px_45px_-25px_rgba(99,102,241,0.7)] hover:scale-[1.01]"
              >
                Edit Information
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
