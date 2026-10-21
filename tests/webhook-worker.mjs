// Offline regression tests. Node 24; no packages, credentials or network required.
import { stripTypeScriptTypes } from 'node:module';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
const dir = mkdtempSync(join(tmpdir(), 'adctor-test-'));
try {
  for (const name of ['index', 'stripe', 'x402', 'crawler-detect']) {
    const source = readFileSync(new URL(`../worker/src/${name}.ts`, import.meta.url), 'utf8');
    writeFileSync(join(dir, `${name}.mjs`), stripTypeScriptTypes(source).replace(/from "\.\/(.*?)"/g, 'from "./$1.mjs"'));
  }
  const { default: worker } = await import(pathToFileURL(join(dir, 'index.mjs')));
  const { verifyWebhookSignature: verify } = await import(pathToFileURL(join(dir, 'stripe.mjs')));
  const secret = 'offline-test-only';
  const payload = JSON.stringify({type:'checkout.session.completed',data:{object:{id:'cs_test',metadata:{token_id:'test-token'}}}});
  const now = Math.floor(Date.now()/1000);
  const signature = (time, body=payload) => `t=${time},v1=${createHmac('sha256',secret).update(`${time}.${body}`).digest('hex')}`;
  assert.equal(await verify(payload, signature(now), secret), true);
  assert.equal(await verify(payload+' ', signature(now), secret), false);
  assert.equal(await verify(payload, signature(now-301), secret), false);
  assert.equal(await verify(payload, signature(now+301), secret), false);
  assert.equal(await verify(payload, signature(now), ''), false);
  assert.equal(await verify(payload, signature(now), 'wrong'), false);
  assert.equal(await verify(payload, `v1=${'0'.repeat(64)},${signature(now)}`, secret), true);
  assert.equal(await verify(payload, 't=NaN,v1=bad', secret), false);
  const entries = new Map([['pending:cs_test','pending']]);
  let writes = 0;
  const env = {TOKENS:{get:async k=>entries.get(k),put:async(k,v)=>{writes++;entries.set(k,v)},delete:async k=>entries.delete(k)},ORIGIN_URL:'https://origin.invalid',STRIPE_WEBHOOK_SECRET:''};
  const request = sig => new Request('https://site.invalid/_adctor/webhook',{method:'POST',body:payload,headers:{'Stripe-Signature':sig}});
  assert.equal((await worker.fetch(request(''),env)).status,503);
  assert.equal(writes,0);
  env.STRIPE_WEBHOOK_SECRET=secret;
  assert.equal((await worker.fetch(request('invalid'),env)).status,400);
  assert.equal(writes,0);
  assert.equal((await worker.fetch(request(signature(now)),env)).status,200);
  assert.equal(writes,1);
  assert.equal(entries.has('pending:cs_test'),false);
  env.STRIPE_WEBHOOK_SECRET='';
  assert.equal((await worker.fetch(new Request('https://site.invalid/_adctor/health'),env)).status,200);
  globalThis.fetch=async req=>{assert.equal(new URL(req.url).hostname,'origin.invalid');return new Response('original content')};
  assert.equal(await (await worker.fetch(new Request('https://site.invalid/page',{headers:{'User-Agent':'Mozilla/5.0'}}),env)).text(),'original content');
  const granted=await worker.fetch(new Request('https://site.invalid/page',{headers:{'User-Agent':'GPTBot','X-Adctor-Token':'test-token'}}),env);
  assert.equal(granted.status,200);
  assert.equal(granted.headers.get('X-Adctor-Access'),'granted');
  assert.equal((await worker.fetch(new Request('https://site.invalid/page',{headers:{'User-Agent':'GPTBot'}}),env)).status,402);
  console.log('Worker: 20 assertions passed; external network disabled by stub');
} finally { rmSync(dir,{recursive:true,force:true}); }
