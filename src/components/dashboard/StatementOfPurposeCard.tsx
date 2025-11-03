import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface StatementOfPurposeCardProps {
  userId: string;
  isSuperAdmin: boolean;
}

export const StatementOfPurposeCard = ({ userId, isSuperAdmin }: StatementOfPurposeCardProps) => {
  const [statement, setStatement] = useState<any>(null);
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatement();
  }, [userId]);

  const fetchStatement = async () => {
    try {
      const { data, error } = await supabase
        .from("statements_of_purpose")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setStatement(data);
        setContent(data.content || "");
      }
    } catch (error) {
      console.error("Error fetching statement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (statement) {
        const { error } = await supabase
          .from("statements_of_purpose")
          .update({ content })
          .eq("id", statement.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("statements_of_purpose")
          .insert({ user_id: userId, content });

        if (error) throw error;
      }

      toast.success("Statement saved successfully");
      setEditing(false);
      fetchStatement();
    } catch (error: any) {
      toast.error(error.message || "Failed to save statement");
    }
  };

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-white">Statement of Financial Purpose</CardTitle>
          <CardDescription className="text-white/60">Loading your narrative...</CardDescription>
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
        <CardTitle className="text-white">Statement of Financial Purpose</CardTitle>
        <CardDescription className="text-white/60">
          Your financial goals and values
        </CardDescription>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Write your statement of financial purpose..."
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
            {content ? (
              <p className="whitespace-pre-wrap text-white/75">{content}</p>
            ) : (
              <p className="text-white/60">No statement recorded yet</p>
            )}
            <Button
              onClick={() => setEditing(true)}
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-[0_20px_45px_-25px_rgba(99,102,241,0.7)] hover:scale-[1.01]"
            >
              Edit Statement
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
