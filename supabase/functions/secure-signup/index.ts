import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, fullName, inviteCode } = await req.json();

    // Validate inputs
    if (!email || !password || !fullName || !inviteCode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Start a transaction-like process
    // 1. Check invite code exists and is unused
    const { data: inviteData, error: inviteError } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode)
      .eq('is_used', false)
      .maybeSingle();

    if (inviteError || !inviteData) {
      console.log('Invalid invite code attempt:', { inviteCode, error: inviteError });
      return new Response(
        JSON.stringify({ error: 'Invalid or already used invite code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Create the user account
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
      },
    });

    if (signUpError) {
      console.error('Signup error:', signUpError);
      return new Response(
        JSON.stringify({ error: signUpError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Mark invite code as used
    const { error: updateError } = await supabaseAdmin
      .from('invite_codes')
      .update({
        is_used: true,
        used_by: authData.user.id,
        used_at: new Date().toISOString(),
      })
      .eq('code', inviteCode)
      .eq('is_used', false); // Double-check to prevent race conditions

    if (updateError) {
      // Rollback: delete the user if we can't mark the code as used
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error('Failed to mark invite code as used:', updateError);
      return new Response(
        JSON.stringify({ error: 'Signup failed. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Assign client role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'client',
      });

    if (roleError) {
      // Rollback: delete the user if we can't assign role
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      // Unmark the invite code
      await supabaseAdmin
        .from('invite_codes')
        .update({ is_used: false, used_by: null, used_at: null })
        .eq('code', inviteCode);
      
      console.error('Failed to assign user role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Signup failed. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successful signup:', { userId: authData.user.id, email });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account created successfully. You can now log in.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Unexpected error in secure-signup:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});