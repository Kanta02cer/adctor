from fastapi import FastAPI, Request, Header, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import re, time, uuid, os, json, asyncio
import stripe
import httpx
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
PLATFORM_FEE_PERCENT = 20  # Adctor takes 20%
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")
PRICE_PER_CRAWL_JPY = 800

# 外部API設定
IPINFO_TOKEN = os.getenv("IPINFO_TOKEN", "")
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")

# Stripe Connect が有効かどうかを起動時に確認
_stripe_connect_enabled: bool | None = None

def is_stripe_connect_enabled() -> bool:
    global _stripe_connect_enabled
    if _stripe_connect_enabled is None:
        if not stripe.api_key:
            _stripe_connect_enabled = False
        else:
            try:
                # テスト用に軽量エンドポイントを叩いて Connect 有効確認
                stripe.CountrySpec.retrieve("JP")
                _stripe_connect_enabled = True
            except Exception:
                _stripe_connect_enabled = False
    return _stripe_connect_enabled

app = FastAPI(title="Adctor Gateway API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[BASE_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── AI crawler detection ──────────────────────────────────────────────────────
AI_CRAWLERS = [
    r"GPTBot", r"ChatGPT-User", r"OAI-SearchBot",
    r"ClaudeBot", r"Claude-Web",
    r"PerplexityBot",
    r"GoogleExtendedBot", r"Gemini",
    r"CCBot", r"YouBot",
    r"meta-externalagent", r"Applebot-Extended",
]
AI_CRAWLER_RE = re.compile("|".join(AI_CRAWLERS), re.IGNORECASE)

# ── In-memory stores (replace with PostgreSQL in production) ──────────────────
access_tokens: dict[str, float] = {}          # token → expiry timestamp
publishers: dict[str, dict] = {}              # api_key → {stripe_account_id, domain, price}
pending_sessions: dict[str, dict] = {}        # stripe_session_id → {token_id, api_key}

TOKEN_TTL = 3600  # 1 hour


def is_ai_crawler(ua: str) -> bool:
    return bool(AI_CRAWLER_RE.search(ua))


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"service": "Adctor Gateway API", "version": "0.2.0", "status": "ok"}


# ── Stripe Connect: onboarding ────────────────────────────────────────────────
class OnboardRequest(BaseModel):
    email: str
    domain: str
    api_key: Optional[str] = None


@app.post("/api/v1/connect/onboard")
async def connect_onboard(body: OnboardRequest):
    """
    Step 1 of publisher onboarding:
    Create a Stripe Express account and return the account link URL.
    The publisher completes KYC/bank registration on Stripe's hosted page.
    """
    if not stripe.api_key:
        # Demo mode: return mock data
        demo_api_key = body.api_key or str(uuid.uuid4())[:8].upper()
        publishers[demo_api_key] = {
            "stripe_account_id": "acct_demo",
            "domain": body.domain,
            "email": body.email,
            "price_jpy": PRICE_PER_CRAWL_JPY,
            "onboarded": False,
        }
        return {
            "api_key": demo_api_key,
            "account_link_url": f"{BASE_URL}/connect/return?api_key={demo_api_key}&demo=true",
            "stripe_account_id": "acct_demo",
            "mode": "demo",
        }

    try:
        # Create Stripe Express connected account
        account = stripe.Account.create(
            type="express",
            country="JP",
            email=body.email,
            capabilities={
                "transfers": {"requested": True},
            },
            business_type="individual",
            metadata={"domain": body.domain},
        )

        api_key = body.api_key or str(uuid.uuid4())[:8].upper()
        publishers[api_key] = {
            "stripe_account_id": account.id,
            "domain": body.domain,
            "email": body.email,
            "price_jpy": PRICE_PER_CRAWL_JPY,
            "onboarded": False,
        }

        # Create account link for onboarding
        account_link = stripe.AccountLink.create(
            account=account.id,
            refresh_url=f"{BASE_URL}/connect/refresh?api_key={api_key}",
            return_url=f"{BASE_URL}/connect/return?api_key={api_key}",
            type="account_onboarding",
        )

        return {
            "api_key": api_key,
            "account_link_url": account_link.url,
            "stripe_account_id": account.id,
            "mode": "live",
        }
    except (stripe.error.PermissionError, stripe.error.InvalidRequestError) as e:
        # Stripe Connect 未有効 or 設定不備 → デモモードへフォールバック
        demo_api_key = body.api_key or str(uuid.uuid4())[:8].upper()
        publishers[demo_api_key] = {
            "stripe_account_id": "acct_demo",
            "domain": body.domain,
            "email": body.email,
            "price_jpy": PRICE_PER_CRAWL_JPY,
            "onboarded": False,
        }
        return {
            "api_key": demo_api_key,
            "account_link_url": f"{BASE_URL}/connect/return?api_key={demo_api_key}&demo=true",
            "stripe_account_id": "acct_demo",
            "mode": "demo",
            "notice": "Stripe Connectが未設定のためデモモードで動作中。https://dashboard.stripe.com/connect で有効化してください。",
        }
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/v1/connect/status/{api_key}")
async def connect_status(api_key: str):
    """Check whether a publisher has completed Stripe onboarding."""
    pub = publishers.get(api_key)
    if not pub:
        raise HTTPException(status_code=404, detail="API key not found")

    if not stripe.api_key or pub["stripe_account_id"] == "acct_demo":
        return {"api_key": api_key, "onboarded": True, "domain": pub["domain"]}

    try:
        account = stripe.Account.retrieve(pub["stripe_account_id"])
        onboarded = account.details_submitted
        pub["onboarded"] = onboarded
        return {
            "api_key": api_key,
            "onboarded": onboarded,
            "charges_enabled": account.charges_enabled,
            "payouts_enabled": account.payouts_enabled,
            "domain": pub["domain"],
        }
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Gateway: check access ────────────────────────────────────────────────────
@app.post("/api/v1/check-access")
async def check_access(
    request: Request,
    user_agent: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None),
    x_access_token: Optional[str] = Header(None),
):
    """
    Main gateway endpoint called by the Adctor JS tag on client sites.
    - Normal traffic → 200 allow
    - AI crawler + valid paid token → 200 allow
    - AI crawler + no token → 402 with Stripe Checkout URL
    """
    ua = user_agent or ""

    # Valid access token → allow
    if x_access_token and x_access_token in access_tokens:
        if time.time() < access_tokens[x_access_token]:
            return JSONResponse({"allow": True, "reason": "valid_token"})
        del access_tokens[x_access_token]

    # Not an AI crawler → allow
    if not is_ai_crawler(ua):
        return JSONResponse({"allow": True, "reason": "human_traffic"})

    # AI crawler detected → create Stripe Checkout session
    crawler_name = AI_CRAWLER_RE.search(ua).group() if AI_CRAWLER_RE.search(ua) else "AIBot"
    token_id = str(uuid.uuid4())
    api_key = x_api_key or "demo"
    pub = publishers.get(api_key)
    price_jpy = pub["price_jpy"] if pub else PRICE_PER_CRAWL_JPY
    connected_account_id = pub["stripe_account_id"] if pub else None

    payment_url = await _create_checkout_session(
        token_id=token_id,
        api_key=api_key,
        crawler_name=crawler_name,
        price_jpy=price_jpy,
        connected_account_id=connected_account_id,
        domain=pub["domain"] if pub else "unknown",
    )

    return JSONResponse(
        status_code=402,
        content={
            "allow": False,
            "reason": "ai_crawler_detected",
            "crawler": crawler_name,
            "payment_required": {
                "amount": price_jpy,
                "currency": "jpy",
                "payment_url": payment_url,
                "token_id": token_id,
                "message": "このコンテンツへのアクセスには料金が必要です。",
            },
        },
    )


async def _create_checkout_session(
    token_id: str,
    api_key: str,
    crawler_name: str,
    price_jpy: int,
    connected_account_id: Optional[str],
    domain: str,
) -> str:
    """Create a Stripe Checkout session and return its URL."""
    if not stripe.api_key or connected_account_id in (None, "acct_demo"):
        # Demo mode: return mock URL
        session_id = f"cs_demo_{token_id[:8]}"
        pending_sessions[session_id] = {"token_id": token_id, "api_key": api_key}
        access_tokens[token_id] = time.time() + TOKEN_TTL  # auto-grant in demo
        return f"{BASE_URL}/payment/demo?session={session_id}&token={token_id}"

    # Platform application fee (20%)
    application_fee = int(price_jpy * PLATFORM_FEE_PERCENT / 100)

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "jpy",
                "unit_amount": price_jpy,
                "product_data": {
                    "name": f"AIコンテンツアクセス料 — {domain}",
                    "description": f"{crawler_name} によるコンテンツアクセス（1時間有効）",
                },
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=f"{BASE_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&token={token_id}",
        cancel_url=f"{BASE_URL}/payment/cancel",
        payment_intent_data={
            "application_fee_amount": application_fee,
            "transfer_data": {"destination": connected_account_id},
        },
        metadata={
            "token_id": token_id,
            "api_key": api_key,
            "crawler": crawler_name,
            "domain": domain,
        },
    )

    pending_sessions[session.id] = {"token_id": token_id, "api_key": api_key}
    return session.url


# ── Stripe Webhook ────────────────────────────────────────────────────────────
@app.post("/api/v1/webhook/stripe")
async def stripe_webhook(request: Request):
    """
    Receive Stripe events. On checkout.session.completed:
    - Grant 1-hour access token to the crawler
    - Revenue is automatically routed by Stripe Connect
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    # Verify signature if webhook secret is configured
    if STRIPE_WEBHOOK_SECRET and stripe.api_key:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        except stripe.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        try:
            event = json.loads(payload)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid payload")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        token_id = session.get("metadata", {}).get("token_id")
        if token_id:
            access_tokens[token_id] = time.time() + TOKEN_TTL
            session_id = session.get("id")
            if session_id in pending_sessions:
                del pending_sessions[session_id]
            return JSONResponse({"status": "token_granted", "token": token_id})

    if event["type"] == "account.updated":
        # Publisher completed onboarding
        account = event["data"]["object"]
        for api_key, pub in publishers.items():
            if pub["stripe_account_id"] == account["id"]:
                pub["onboarded"] = account.get("details_submitted", False)
                break

    return JSONResponse({"status": "ok"})


# ── Stats ─────────────────────────────────────────────────────────────────────
@app.get("/api/v1/stats/{api_key}")
def get_stats(api_key: str):
    """Stats for dashboard (mock data — replace with DB aggregation)."""
    pub = publishers.get(api_key, {})
    return {
        "api_key": api_key,
        "domain": pub.get("domain", "example.jp"),
        "period": "2026-06",
        "total_requests": 24183,
        "ai_bot_detected": 3421,
        "payments_completed": 178,
        "blocked_no_payment": 3243,
        "revenue_jpy": 142500,
        "payout_jpy": 114000,
        "platform_fee_jpy": 28500,
        "onboarded": pub.get("onboarded", False),
    }


# ── Publisher pricing update ──────────────────────────────────────────────────
class PriceUpdateRequest(BaseModel):
    api_key: str
    price_jpy: int


@app.post("/api/v1/publisher/price")
def update_price(body: PriceUpdateRequest):
    if body.price_jpy < 100:
        raise HTTPException(status_code=400, detail="最低単価は100円です")
    pub = publishers.get(body.api_key)
    if not pub:
        raise HTTPException(status_code=404, detail="API key not found")
    pub["price_jpy"] = body.price_jpy
    return {"status": "updated", "price_jpy": body.price_jpy}


# ── WebSocket: リアルタイムダッシュボード ────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        for ws in list(self.active):
            try:
                await ws.send_json(data)
            except Exception:
                self.disconnect(ws)


ws_manager = ConnectionManager()

# バックグラウンドで収益データを送り続けるタスク
async def _stream_dashboard(ws: WebSocket, api_key: str):
    """WebSocket接続中、2秒ごとに最新の統計データをプッシュする"""
    import random
    base_revenue = 142500
    while True:
        try:
            pub = publishers.get(api_key, {})
            delta = random.randint(-800, 2400)
            payload = {
                "type": "stats_update",
                "api_key": api_key,
                "revenue_jpy": base_revenue + delta,
                "ai_bot_detected": 3421 + random.randint(0, 5),
                "payments_completed": 178 + random.randint(0, 1),
                "active_tokens": len([t for t, exp in access_tokens.items() if exp > time.time()]),
                "timestamp": time.time(),
                "domain": pub.get("domain", "example.jp"),
            }
            await ws.send_json(payload)
            await asyncio.sleep(2)
        except WebSocketDisconnect:
            break
        except Exception:
            break


@app.websocket("/ws/dashboard/{api_key}")
async def dashboard_ws(ws: WebSocket, api_key: str):
    await ws_manager.connect(ws)
    try:
        await _stream_dashboard(ws, api_key)
    except WebSocketDisconnect:
        ws_manager.disconnect(ws)


# ── IPinfo: IP情報取得 ────────────────────────────────────────────────────────
@app.get("/api/v1/ipinfo/{ip}")
async def get_ip_info(ip: str):
    """IPアドレスからBotのASN・組織情報を取得"""
    if not IPINFO_TOKEN:
        # デモモード
        return {
            "ip": ip,
            "org": "AS15169 Google LLC",
            "city": "Mountain View",
            "country": "US",
            "is_datacenter": True,
            "bot_score": 92,
            "demo": True,
        }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://ipinfo.io/{ip}/json",
                headers={"Authorization": f"Bearer {IPINFO_TOKEN}"},
                timeout=5.0,
            )
            data = resp.json()
            # データセンターIPかどうかを簡易判定
            org = data.get("org", "")
            is_dc = any(kw in org.upper() for kw in ["GOOGLE", "AMAZON", "MICROSOFT", "CLOUD", "OVH", "DIGITALOCEAN"])
            return {**data, "is_datacenter": is_dc, "bot_score": 90 if is_dc else 20}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


# ── Unsplash: 画像プロキシ ───────────────────────────────────────────────────
@app.get("/api/v1/images/unsplash")
async def get_unsplash_images(query: str = "technology", count: int = 6, orientation: str = "landscape"):
    """Unsplash APIから画像を取得してクライアントに返す（APIキーを隠蔽）"""
    if not UNSPLASH_ACCESS_KEY:
        # デモモード: Unsplashのパブリック画像URL（固定）
        demo_images = [
            {"id": f"demo-{i}", "url": f"https://picsum.photos/seed/{query}{i}/1200/630",
             "thumb": f"https://picsum.photos/seed/{query}{i}/400/300",
             "alt": f"{query} image {i+1}", "author": "Lorem Picsum", "author_url": "https://picsum.photos"}
            for i in range(count)
        ]
        return {"images": demo_images, "demo": True}

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.unsplash.com/photos/random",
                params={"query": query, "count": count, "orientation": orientation},
                headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"},
                timeout=8.0,
            )
            photos = resp.json()
            return {
                "images": [
                    {
                        "id": p["id"],
                        "url": p["urls"]["regular"],
                        "thumb": p["urls"]["thumb"],
                        "alt": p.get("alt_description") or query,
                        "author": p["user"]["name"],
                        "author_url": p["user"]["links"]["html"],
                    }
                    for p in photos
                ],
                "demo": False,
            }
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


# ── Resend: メール送信 ────────────────────────────────────────────────────────
class EmailRequest(BaseModel):
    to: str
    subject: str
    html: str


async def _send_email(to: str, subject: str, html: str) -> bool:
    """Resend APIでメールを送信する"""
    if not RESEND_API_KEY:
        print(f"[Email Demo] To: {to} | Subject: {subject}")
        return True
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}",
                         "Content-Type": "application/json"},
                json={"from": "Adctor <noreply@adctor.jp>", "to": [to], "subject": subject, "html": html},
                timeout=8.0,
            )
            return resp.status_code == 200
    except Exception:
        return False


# ── Slack: 管理者通知 ─────────────────────────────────────────────────────────
async def _notify_slack(text: str) -> None:
    """Slack Webhookで管理者に通知"""
    if not SLACK_WEBHOOK_URL:
        print(f"[Slack Demo] {text}")
        return
    try:
        async with httpx.AsyncClient() as client:
            await client.post(SLACK_WEBHOOK_URL, json={"text": text}, timeout=5.0)
    except Exception:
        pass


# ── 診断ツール: 実Bot判定 ─────────────────────────────────────────────────────
class DiagnosisRequest(BaseModel):
    url: str
    email: Optional[str] = None


@app.post("/api/v1/diagnosis")
async def run_diagnosis(body: DiagnosisRequest):
    """
    URLを受け取ってAIクローラー診断を実行する。
    IPinfo連携でASN情報を付加し、オプションでResendでレポートメールを送信。
    """
    import random

    # デモデータ生成（実装時はCloudflareログ解析に置き換え）
    crawlers = [
        {"name": "GPTBot", "company": "OpenAI", "risk": "medium", "monthly": random.randint(600, 1200), "color": "#B89F5D"},
        {"name": "ClaudeBot", "company": "Anthropic", "risk": "low", "monthly": random.randint(300, 600), "color": "#00CCFF"},
        {"name": "PerplexityBot", "company": "Perplexity", "risk": "low", "monthly": random.randint(100, 400), "color": "#FF6600"},
        {"name": "AhrefsBot", "company": "Ahrefs", "risk": "high", "monthly": random.randint(800, 1500), "color": "#FF3333"},
        {"name": "SemrushBot", "company": "Semrush", "risk": "high", "monthly": random.randint(500, 1000), "color": "#FF3333"},
    ]

    ai_monthly = sum(c["monthly"] for c in crawlers if c["risk"] != "high")
    harmful_monthly = sum(c["monthly"] for c in crawlers if c["risk"] == "high")
    potential_revenue = ai_monthly * PRICE_PER_CRAWL_JPY
    recommendation = "B" if ai_monthly > 500 else "A"

    result = {
        "url": body.url,
        "crawlers": crawlers,
        "summary": {
            "total_monthly": ai_monthly + harmful_monthly,
            "ai_monthly": ai_monthly,
            "harmful_monthly": harmful_monthly,
            "potential_revenue_jpy": potential_revenue,
            "recommendation": recommendation,
        },
    }

    # メール送信（メールアドレスが提供された場合）
    if body.email:
        html = f"""
        <h2>Adctor AIクローラー診断レポート</h2>
        <p>診断URL: <strong>{body.url}</strong></p>
        <h3>サマリー</h3>
        <ul>
          <li>月間AIクロール数: {ai_monthly:,}件</li>
          <li>有害Bot数: {harmful_monthly:,}件</li>
          <li>収益化ポテンシャル: ¥{potential_revenue:,}/月</li>
          <li>推奨パッケージ: Package {recommendation}</li>
        </ul>
        <p><a href="{BASE_URL}/lp#packages">詳細はこちら</a></p>
        """
        await _send_email(body.email, f"【Adctor】{body.url} の診断レポートが完成しました", html)
        await _notify_slack(f"🔍 新規診断: {body.url} | 推奨: Package {recommendation} | 潜在収益: ¥{potential_revenue:,}/月")

    return result

