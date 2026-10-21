"""Offline handler unit tests with a mocked Stripe verifier, not an SDK integration test."""
import ast
import asyncio
import time
from pathlib import Path
from types import SimpleNamespace

source = (Path(__file__).parent.parent / 'backend/main.py').read_text()
tree = ast.parse(source)  # Also validates syntax without writing bytecode caches.
handler = next(n for n in tree.body if isinstance(n, ast.AsyncFunctionDef) and n.name == 'stripe_webhook')
handler.decorator_list = []

class HTTPException(Exception):
    def __init__(self, status_code, detail):
        self.status_code = status_code

class Request:
    headers = {'stripe-signature': 'test-signature'}
    reads = 0
    async def body(self):
        self.reads += 1
        return b'test-payload'

calls = []
event = {'type':'checkout.session.completed','data':{'object':{'id':'cs_test','metadata':{'token_id':'test-token'}}}}
def verify(payload, signature, secret):
    calls.append((payload, signature, secret))
    if signature != 'test-signature':
        raise ValueError('invalid')
    return event

scope = dict(Request=Request, HTTPException=HTTPException, JSONResponse=lambda x:x,
    STRIPE_WEBHOOK_SECRET='', stripe=SimpleNamespace(api_key=None, Webhook=SimpleNamespace(construct_event=verify), SignatureVerificationError=RuntimeError),
    access_tokens={}, pending_sessions={'cs_test':True}, publishers={}, time=time, TOKEN_TTL=3600)
exec(compile(ast.Module(body=[handler], type_ignores=[]), '<webhook>', 'exec'), scope)

async def run():
    req=Request()
    try: await scope['stripe_webhook'](req)
    except HTTPException as e: assert e.status_code == 503
    else: raise AssertionError('missing secret accepted')
    assert req.reads == 0 and not calls and not scope['access_tokens']
    scope['STRIPE_WEBHOOK_SECRET']='offline-test-only'
    req.headers={'stripe-signature':'invalid'}
    try: await scope['stripe_webhook'](req)
    except HTTPException as e: assert e.status_code == 400
    else: raise AssertionError('invalid signature accepted')
    assert not scope['access_tokens']
    req.headers={'stripe-signature':'test-signature'}
    result=await scope['stripe_webhook'](req)
    assert result['status']=='token_granted' and 'test-token' in scope['access_tokens']
    assert 'cs_test' not in scope['pending_sessions']
    assert len(calls)==2  # Verifies even when Stripe API key is absent.
    scope['publishers']['publisher']={'stripe_account_id':'acct_test','onboarded':False}
    event.update(type='account.updated',data={'object':{'id':'acct_test','details_submitted':True}})
    assert (await scope['stripe_webhook'](req))['status']=='ok'
    assert scope['publishers']['publisher']['onboarded'] is True
    print('Backend: 9 assertions passed; full source syntax valid; verifier mocked')

asyncio.run(run())
