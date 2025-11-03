import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BalanceSheet {
  id: string;
  user_id: string;
  assets: Record<string, number>;
  liabilities: Record<string, number>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    console.log(`Calculating net worth for ${currentMonth}/${currentYear}`);

    // Get all users with balance sheets
    const { data: balanceSheets, error: balanceSheetsError } = await supabase
      .from("balance_sheets")
      .select("id, user_id, assets, liabilities");

    if (balanceSheetsError) {
      console.error("Error fetching balance sheets:", balanceSheetsError);
      throw balanceSheetsError;
    }

    if (!balanceSheets || balanceSheets.length === 0) {
      console.log("No balance sheets found");
      return new Response(
        JSON.stringify({ message: "No balance sheets to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate net worth for each user
    const netWorthRecords = [];

    for (const sheet of balanceSheets as BalanceSheet[]) {
      // Calculate total assets
      const totalAssets = Object.values(sheet.assets || {}).reduce(
        (sum, value) => sum + (typeof value === "number" ? value : 0),
        0
      );

      // Calculate total liabilities
      const totalLiabilities = Object.values(sheet.liabilities || {}).reduce(
        (sum, value) => sum + (typeof value === "number" ? value : 0),
        0
      );

      const netWorth = totalAssets - totalLiabilities;

      netWorthRecords.push({
        user_id: sheet.user_id,
        net_worth: netWorth,
        calculated_from_balance_sheet_id: sheet.id,
        month: currentMonth,
        year: currentYear,
      });

      console.log(
        `User ${sheet.user_id}: Assets=$${totalAssets}, Liabilities=$${totalLiabilities}, Net Worth=$${netWorth}`
      );
    }

    // Insert net worth records
    const { error: insertError } = await supabase
      .from("net_worth_history")
      .insert(netWorthRecords);

    if (insertError) {
      console.error("Error inserting net worth records:", insertError);
      throw insertError;
    }

    console.log(`Successfully calculated net worth for ${netWorthRecords.length} users`);

    return new Response(
      JSON.stringify({
        message: "Net worth calculation completed",
        recordsProcessed: netWorthRecords.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in calculate-monthly-net-worth:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
