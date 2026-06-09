// x402 Payment Required protocol
// Based on: https://x402.org / Coinbase x402 spec
// Adctor implements a hybrid: x402 headers + Stripe Checkout fallback

export interface X402PaymentDetails {
  scheme: "stripe-checkout" | "exact";
  amount: number;
  currency: "jpy";
  paymentUrl: string;
  tokenId: string;
  description: string;
  resource: string;
  validFor: number; // seconds
}

export function build402Response(details: X402PaymentDetails): Response {
  const body = JSON.stringify({
    error: "Payment Required",
    message: "このコンテンツへのAIクローラーアクセスには利用料が必要です。",
    payment: {
      scheme: details.scheme,
      amount: details.amount,
      currency: details.currency,
      payment_url: details.paymentUrl,
      token_id: details.tokenId,
      valid_for_seconds: details.validFor,
      description: details.description,
    },
    // x402 standard header format
    "x402": {
      version: "1.0",
      accepts: [
        {
          scheme: "stripe-checkout",
          network: "stripe-jp",
          maxAmountRequired: String(details.amount),
          resource: details.resource,
          description: details.description,
          payTo: details.paymentUrl,
          maxTimeoutSeconds: 300,
        }
      ]
    }
  }, null, 2);

  return new Response(body, {
    status: 402,
    headers: {
      "Content-Type": "application/json",
      // x402 standard headers
      "X-Payment-Required": "true",
      "X-Payment-Amount": String(details.amount),
      "X-Payment-Currency": details.currency,
      "X-Payment-URL": details.paymentUrl,
      "X-Payment-Token-ID": details.tokenId,
      // Standard
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "X-Payment-Required, X-Payment-URL, X-Payment-Token-ID",
    },
  });
}

export function build200Response(originResponse: Response, tokenId: string): Response {
  // Clone and add Adctor headers to the allowed response
  const headers = new Headers(originResponse.headers);
  headers.set("X-Adctor-Access", "granted");
  headers.set("X-Adctor-Token", tokenId);
  headers.set("X-Adctor-Powered-By", "Adctor Gateway v0.2");
  return new Response(originResponse.body, {
    status: originResponse.status,
    headers,
  });
}
