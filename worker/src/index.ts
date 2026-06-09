import { detectCrawler } from "./crawler-detect";
import { build402Response, build200Response } from "./x402";
import { createCheckoutSession, verifyWebhookSignature } from "./stripe";

export interface Env {
  // KV for access tokens (optional — falls back to in-memory cache headers)
  TOKENS?: KVNamespace;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_CONNECTED_ACCOUNT_ID: string;

  // Adctor
  PUBLISHER_API_KEY: string;
  ORIGIN_URL: string;
  PRICE_PER_CRAWL_JPY: string;
  PLATFORM_FEE_PERCENT: string;
  DASHBOARD_URL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ── Internal Adctor routes ────────────────────────────────────────────
    // Stripe webhook endpoint (must be excluded from gateway logic)
    if (url.pathname === "/_adctor/webhook" && request.method === "POST") {
      return handleWebhook(request, env);
    }

    // Health check
    if (url.pathname === "/_adctor/health") {
      return new Response(JSON.stringify({ status: "ok", version: "0.2.0" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── Gateway logic ─────────────────────────────────────────────────────
    const userAgent = request.headers.get("User-Agent") || "";
    const detection = detectCrawler(userAgent);

    // Not an AI crawler → proxy through to origin
    if (!detection.isAiCrawler) {
      return proxyToOrigin(request, env, url);
    }

    // Check for valid Adctor access token
    const accessToken = request.headers.get("X-Adctor-Token") ||
      url.searchParams.get("adctor_token");

    if (accessToken && env.TOKENS) {
      const tokenData = await env.TOKENS.get(accessToken);
      if (tokenData) {
        // Valid token — proxy through
        return proxyToOrigin(request, env, url, accessToken);
      }
    }

    // AI crawler without valid token → 402
    const tokenId = crypto.randomUUID();
    const domain = url.hostname;
    const priceJpy = parseInt(env.PRICE_PER_CRAWL_JPY || "800", 10);
    const platformFee = parseInt(env.PLATFORM_FEE_PERCENT || "20", 10);
    const dashboardUrl = env.DASHBOARD_URL || "https://adctor.io";

    // Create Stripe Checkout session if credentials are available
    let paymentUrl: string;
    let sessionId: string | null = null;

    if (env.STRIPE_SECRET_KEY && env.STRIPE_CONNECTED_ACCOUNT_ID) {
      try {
        const session = await createCheckoutSession({
          tokenId,
          crawlerName: detection.crawlerName || "AIBot",
          domain,
          priceJpy,
          connectedAccountId: env.STRIPE_CONNECTED_ACCOUNT_ID,
          platformFeePercent: platformFee,
          successUrl: `${dashboardUrl}/payment/success?token=${tokenId}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${dashboardUrl}/payment/cancel`,
          stripeSecretKey: env.STRIPE_SECRET_KEY,
        });
        paymentUrl = session.url;
        sessionId = session.id;

        // Store pending session in KV if available
        if (env.TOKENS && sessionId) {
          await env.TOKENS.put(
            `pending:${sessionId}`,
            JSON.stringify({ tokenId, domain, crawler: detection.crawlerName }),
            { expirationTtl: 600 } // 10 min to complete payment
          );
        }
      } catch (e) {
        console.error("Stripe session creation failed:", e);
        paymentUrl = `${dashboardUrl}/payment/demo?token=${tokenId}`;
      }
    } else {
      // Demo mode
      paymentUrl = `${dashboardUrl}/payment/demo?token=${tokenId}`;
    }

    return build402Response({
      scheme: "stripe-checkout",
      amount: priceJpy,
      currency: "jpy",
      paymentUrl,
      tokenId,
      description: `${detection.crawlerName || "AIBot"} — ${domain} コンテンツアクセス料`,
      resource: request.url,
      validFor: 3600,
    });
  },
};

// ── Proxy to origin ─────────────────────────────────────────────────────────
async function proxyToOrigin(
  request: Request,
  env: Env,
  url: URL,
  grantedToken?: string
): Promise<Response> {
  if (!env.ORIGIN_URL) {
    return new Response("ORIGIN_URL not configured", { status: 500 });
  }

  const originUrl = new URL(url.pathname + url.search, env.ORIGIN_URL);
  const originRequest = new Request(originUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });

  const originResponse = await fetch(originRequest);

  if (grantedToken) {
    return build200Response(originResponse, grantedToken);
  }
  return originResponse;
}

// ── Stripe Webhook handler ──────────────────────────────────────────────────
async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const payload = await request.text();
  const signature = request.headers.get("Stripe-Signature") || "";

  // Verify webhook signature
  if (env.STRIPE_WEBHOOK_SECRET) {
    const valid = await verifyWebhookSignature(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    if (!valid) {
      return new Response("Invalid signature", { status: 400 });
    }
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      metadata?: { token_id?: string };
    };
    const tokenId = session.metadata?.token_id;

    if (tokenId && env.TOKENS) {
      // Grant 1-hour access token
      await env.TOKENS.put(
        tokenId,
        JSON.stringify({
          grantedAt: Date.now(),
          sessionId: session.id,
        }),
        { expirationTtl: 3600 }
      );

      // Clean up pending session
      await env.TOKENS.delete(`pending:${session.id}`);

      console.log(`[Adctor] Access token granted: ${tokenId}`);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
