import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let publicKey = Deno.env.get("VAPID_PUBLIC_KEY");

    if (!publicKey) {
      return new Response(JSON.stringify({ error: "Missing VAPID_PUBLIC_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Remove quotes if present (sometimes secrets are saved with quotes)
    publicKey = publicKey.replace(/^["']|["']$/g, "").trim();

    return new Response(JSON.stringify({ publicKey }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
