# Webhook verification change — 2026-10-21

Scope: internal Adctor PoC backend and Worker only; ATHLEE production ownership/deployment is unverified. This is not a PHP runtime patch.

Both handlers previously accepted unsigned events when the webhook signing secret was missing (Python also required the API key to enable verification). They now return 503 before processing when signing configuration is absent, and 400 for invalid signatures. Python verifies even without an API key. Worker rejects signatures outside a 300-second window, accepts any valid v1 signature during rotation, and no longer logs granted bearer tokens.

Normal page proxying, health checks, crawler payment responses, existing token access and verified webhook event handling remain unchanged. Unsigned demo webhook simulation is deliberately refused; the demo frontend remains available. Event deduplication, payment status/amount correlation and publisher authorization are not solved by this change.

## Offline verification

- Node 24: `node tests/webhook-worker.mjs` — passes, with generated local signatures and in-memory KV; fetch replaced by an origin stub.
- Python: `python3 tests/webhook-backend.py` — passes, validates full source syntax and isolated handler behavior with mocked Stripe SDK. This is not a full FastAPI/Stripe SDK integration test.
- No customer writes, real payment requests, production tests or new credentials.

## Deployment and rollback

Do not deploy until the exact Python/Worker deployment and owner, current release, existing signing configuration presence (not its value), clock synchronization, backup and rollback are confirmed. Test valid signed sandbox delivery and invalid delivery in the authorized staging environment first. Preserve KV and Python state according to the actual deployment persistence plan; the current Python in-memory stores require special attention during restarts.

Deploy only these changes to the confirmed internal service; frontend export is unaffected. Verify health, human proxy, paid-token access and signed delivery. Restore the prior deployment artifact if ordinary functionality regresses; reverting restores the original missing-secret exposure, so do not expose an unconfigured webhook as a workaround. Never use this PR to release unrelated features or ATHLEE changes.

Official verification guidance: https://docs.stripe.com/webhooks
