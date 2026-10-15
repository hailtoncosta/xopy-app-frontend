import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PushNotifyRequest = {
  recipientUserId: string;
  payload: {
    title: string;
    body?: string;
    tag?: string;
    url?: string;
    conversationId?: string;
  };
};

// ========== CRYPTO HELPERS ==========

function base64UrlEncode(data: Uint8Array): string {
  return base64Encode(data)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.trim().replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) base64 += "=";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// VAPID JWT creation
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKey: CryptoKey
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 60 * 60, sub: subject };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER to raw if needed
  const sigBytes = new Uint8Array(signature);
  let rawSig: Uint8Array;
  if (sigBytes.length === 64) {
    rawSig = sigBytes;
  } else {
    let offset = 2;
    const rLen = sigBytes[offset + 1];
    const rStart = offset + 2;
    offset = rStart + rLen;
    const sLen = sigBytes[offset + 1];
    const sStart = offset + 2;

    let r = sigBytes.slice(rStart, rStart + rLen);
    let s = sigBytes.slice(sStart, sStart + sLen);
    if (r.length === 33 && r[0] === 0) r = r.slice(1);
    if (s.length === 33 && s[0] === 0) s = s.slice(1);

    const rPadded = new Uint8Array(32);
    const sPadded = new Uint8Array(32);
    rPadded.set(r, 32 - r.length);
    sPadded.set(s, 32 - s.length);
    rawSig = new Uint8Array(64);
    rawSig.set(rPadded, 0);
    rawSig.set(sPadded, 32);
  }

  return `${unsignedToken}.${base64UrlEncode(rawSig)}`;
}

// HKDF
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const saltKey = await crypto.subtle.importKey("raw", salt.length ? salt : new Uint8Array(32), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", saltKey, ikm));
  const prkKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const infoWithCounter = new Uint8Array(info.length + 1);
  infoWithCounter.set(info);
  infoWithCounter[info.length] = 1;
  const okm = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, infoWithCounter));
  return okm.slice(0, length);
}

function buildInfo(type: string, context: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(`Content-Encoding: ${type}\0`);
  const result = new Uint8Array(typeBytes.length + context.length);
  result.set(typeBytes);
  result.set(context, typeBytes.length);
  return result;
}

// Encrypt payload (aes128gcm)
async function encryptPayload(
  payload: string,
  subscriptionPubKeyB64: string,
  authSecretB64: string,
  localPublicKey: Uint8Array,
  sharedSecret: Uint8Array
): Promise<Uint8Array> {
  const subscriptionPubKey = base64UrlDecode(subscriptionPubKeyB64);
  const authSecret = base64UrlDecode(authSecretB64);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyLabel = new TextEncoder().encode("P-256\0");
  const clientPubLenBytes = new Uint8Array([0, 65]);
  const serverPubLenBytes = new Uint8Array([0, 65]);

  const context = new Uint8Array(keyLabel.length + 2 + subscriptionPubKey.length + 2 + localPublicKey.length);
  let offset = 0;
  context.set(keyLabel, offset); offset += keyLabel.length;
  context.set(clientPubLenBytes, offset); offset += 2;
  context.set(subscriptionPubKey, offset); offset += subscriptionPubKey.length;
  context.set(serverPubLenBytes, offset); offset += 2;
  context.set(localPublicKey, offset);

  const authInfo = new TextEncoder().encode("Content-Encoding: auth\0");
  const prk = await hkdf(authSecret, sharedSecret, authInfo, 32);
  const cek = await hkdf(salt, prk, buildInfo("aes128gcm", context), 16);
  const nonce = await hkdf(salt, prk, buildInfo("nonce", context), 12);

  const payloadBytes = new TextEncoder().encode(payload);
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes);
  paddedPayload[payloadBytes.length] = 0x02;

  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, paddedPayload));

  // aes128gcm header: salt(16) + rs(4) + idlen(1) + keyid(65)
  const header = new Uint8Array(86);
  header.set(salt, 0);
  header.set(new Uint8Array([0, 0, 16, 0]), 16); // record size
  header[20] = 65;
  header.set(localPublicKey, 21);

  const encrypted = new Uint8Array(header.length + ciphertext.length);
  encrypted.set(header);
  encrypted.set(ciphertext, header.length);
  return encrypted;
}

// Import VAPID private key from base64url raw bytes
async function importVapidPrivateKey(publicKeyB64: string, privateKeyB64: string): Promise<CryptoKey> {
  const publicBytes = base64UrlDecode(publicKeyB64);
  const privateBytes = base64UrlDecode(privateKeyB64);

  if (publicBytes.length !== 65 || publicBytes[0] !== 0x04) throw new Error(`Invalid public key (${publicBytes.length} bytes)`);
  if (privateBytes.length !== 32) throw new Error(`Invalid private key (${privateBytes.length} bytes)`);

  const x = base64UrlEncode(publicBytes.slice(1, 33));
  const y = base64UrlEncode(publicBytes.slice(33, 65));
  const d = base64UrlEncode(privateBytes);

  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x, y, d },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
}

// Send Web Push notification
async function sendWebPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: CryptoKey
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const localKeyPair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
    const localPublicKeyRaw = new Uint8Array(await crypto.subtle.exportKey("raw", localKeyPair.publicKey));

    const subscriptionPubKeyBytes = base64UrlDecode(p256dh);
    const subscriptionPubKey = await crypto.subtle.importKey("raw", subscriptionPubKeyBytes, { name: "ECDH", namedCurve: "P-256" }, false, []);

    const sharedSecretBits = await crypto.subtle.deriveBits({ name: "ECDH", public: subscriptionPubKey }, localKeyPair.privateKey, 256);
    const sharedSecret = new Uint8Array(sharedSecretBits);

    const encrypted = await encryptPayload(payload, p256dh, auth, localPublicKeyRaw, sharedSecret);

    const url = new URL(endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const jwt = await createVapidJwt(audience, "mailto:contato@xopy.com.br", vapidPrivateKey);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "TTL": "86400",
        "Urgency": "high",
        "Authorization": `vapid t=${jwt}, k=${vapidPublicKey}`,
      },
      body: encrypted,
    });

    if (response.ok || response.status === 201) {
      return { success: true, status: response.status };
    } else {
      const text = await response.text();
      return { success: false, status: response.status, error: text };
    }
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) };
  }
}

// ========== MAIN HANDLER ==========

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as PushNotifyRequest;
    const { recipientUserId, payload } = body || ({} as PushNotifyRequest);

    console.log("📤 push-notify called", { recipientUserId, title: payload?.title });

    if (!recipientUserId || !payload?.title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    let VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error("❌ Missing VAPID keys");
      return new Response(JSON.stringify({ error: "VAPID keys not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    VAPID_PUBLIC_KEY = VAPID_PUBLIC_KEY.replace(/^["']|["']$/g, "").trim();
    VAPID_PRIVATE_KEY = VAPID_PRIVATE_KEY.replace(/^["']|["']$/g, "").trim();

    console.log("🔑 VAPID public key length:", VAPID_PUBLIC_KEY.length);

    const vapidPrivateKey = await importVapidPrivateKey(VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch subscriptions
    const { data: subs, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", recipientUserId);

    if (subsError) {
      console.error("❌ Failed to fetch subscriptions:", subsError);
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`📱 Found ${subs?.length || 0} subscriptions for user ${recipientUserId}`);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    if (subs && subs.length > 0) {
      const hasExplicitTag = !!payload.tag;
      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body || "Você recebeu uma nova mensagem",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        // Use a unique tag by default (Android can collapse/replace notifications with the same tag)
        tag: payload.tag || `notification-${Date.now()}`,
        vibrate: [200, 100, 200],
        // Only use renotify when we're intentionally updating an existing notification
        renotify: hasExplicitTag,
        // Avoid requireInteraction on mobile to prevent "stuck" notifications hiding new ones
        requireInteraction: false,
        data: {
          url: payload.url || "/conversas",
          conversationId: payload.conversationId || null,
          timestamp: Date.now(),
        },
      });

      for (const s of subs) {
        console.log("🚀 Sending push to:", s.endpoint.substring(0, 70) + "...");

        const result = await sendWebPush(
          s.endpoint,
          s.p256dh,
          s.auth,
          notificationPayload,
          VAPID_PUBLIC_KEY,
          vapidPrivateKey
        );

        if (result.success) {
          success++;
          console.log("✅ Push sent successfully, status:", result.status);
        } else {
          failed++;
          const errMsg = `${result.status}: ${result.error}`;
          errors.push(errMsg);
          console.error("❌ Push failed:", errMsg);

          // Remove invalid subscriptions (gone or not found)
          if (result.status === 404 || result.status === 410) {
            console.log("🗑️ Removing invalid subscription");
            await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          }
        }
      }
    }

    console.log(`📊 Final result: ${success} sent, ${failed} failed`);

    // Create in-app notification
    try {
      await supabase.from("notifications").insert({
        user_id: recipientUserId,
        title: payload.title,
        message: payload.body || "Você recebeu uma nova mensagem",
        type: "new_message",
        is_read: false,
        data: {
          conversation_id: payload.conversationId,
          url: payload.url || "/conversas",
        },
      });
      console.log("✅ In-app notification created");
    } catch (notifError) {
      console.warn("⚠️ Failed to create in-app notification:", notifError);
    }

    return new Response(JSON.stringify({ ok: true, sent: success, failed, errors }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    console.error("❌ Unexpected error:", e?.message || e, e);
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
