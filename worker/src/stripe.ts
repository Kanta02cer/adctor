export interface CheckoutSessionParams {
  tokenId: string;
  crawlerName: string;
  domain: string;
  priceJpy: number;
  connectedAccountId: string;
  platformFeePercent: number;
  successUrl: string;
  cancelUrl: string;
  stripeSecretKey: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSession> {
  const applicationFee = Math.floor(
    params.priceJpy * (params.platformFeePercent / 100)
  );

  const body = new URLSearchParams({
    "payment_method_types[0]": "card",
    "line_items[0][price_data][currency]": "jpy",
    "line_items[0][price_data][unit_amount]": String(params.priceJpy),
    "line_items[0][price_data][product_data][name]": `AIコンテンツアクセス料 — ${params.domain}`,
    "line_items[0][price_data][product_data][description]":
      `${params.crawlerName} によるコンテンツアクセス（1時間有効）`,
    "line_items[0][quantity]": "1",
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    "payment_intent_data[application_fee_amount]": String(applicationFee),
    "payment_intent_data[transfer_data][destination]": params.connectedAccountId,
    "metadata[token_id]": params.tokenId,
    "metadata[crawler]": params.crawlerName,
    "metadata[domain]": params.domain,
    "metadata[adctor_version]": "0.2",
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stripe API error: ${err}`);
  }

  const data = (await res.json()) as { id: string; url: string };
  return { id: data.id, url: data.url };
}

export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // Stripe webhook signature verification using Web Crypto API
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
  const v1 = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!timestamp || !v1) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expected === v1;
}
