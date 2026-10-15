// Supabase Edge Function: chat-send-message
// Inserts a chat message and dispatches push notification server-side (bypasses client-side RLS issues).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RequestBody = {
  conversationId: string;
  content: string;
  messageType?: "text" | "image" | "file";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase env vars" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const authHeader = req.headers.get("Authorization") ?? "";

    // Client-boundary auth (validate the user token)
    const authed = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await authed.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as RequestBody;

    if (!body?.conversationId || !body?.content?.trim()) {
      return new Response(JSON.stringify({ error: "conversationId and content are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messageType = body.messageType ?? "text";

    // Service role client for privileged reads/writes
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: conv, error: convErr } = await admin
      .from("conversations")
      .select("id,user_id,service_provider_id,status")
      .eq("id", body.conversationId)
      .single();

    if (convErr || !conv) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (conv.status !== "active") {
      return new Response(JSON.stringify({ error: "Conversation is not active" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve service provider user_id (needed both for auth check and recipient)
    const { data: sp, error: spErr } = await admin
      .from("service_providers")
      .select("user_id")
      .eq("id", conv.service_provider_id)
      .single();

    if (spErr || !sp?.user_id) {
      return new Response(JSON.stringify({ error: "Service provider not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isConversationUser = user.id === conv.user_id;
    const isConversationProvider = user.id === sp.user_id;

    if (!isConversationUser && !isConversationProvider) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sender_type = isConversationUser ? "user" : "service_provider";

    const { data: msg, error: msgErr } = await admin
      .from("messages")
      .insert({
        conversation_id: body.conversationId,
        sender_id: user.id,
        sender_type,
        content: body.content.trim(),
        message_type: messageType,
        is_read: false,
      })
      .select("*")
      .single();

    if (msgErr || !msg) {
      return new Response(JSON.stringify({ error: "Failed to insert message", details: msgErr?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update conversation timestamps (non-blocking)
    admin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", body.conversationId)
      .then(() => {})
      .catch(() => {});

    const recipientUserId = isConversationUser ? (sp.user_id as string) : (conv.user_id as string);

    // Dispatch push via existing push-notify function (also writes in-app notification)
    const payload = {
      title: "Nova mensagem",
      body: body.content.length > 50 ? body.content.substring(0, 50) + "..." : body.content,
      url: "/conversas",
      conversationId: body.conversationId,
    };

    const pushResp = await fetch(`${supabaseUrl}/functions/v1/push-notify`, {
      method: "POST",
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({ recipientUserId, payload }),
    });

    // Ignore push failures but surface in response for debugging
    const pushJson = await pushResp.json().catch(() => null);

    return new Response(
      JSON.stringify({ message: msg, push: { ok: pushResp.ok, status: pushResp.status, data: pushJson } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
