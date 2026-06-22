# Local MVP Runbook

企業導入前に、ローカル環境で本番相当のDBとAPIを検証する手順です。

## 1. 依存関係

```bash
cd /Users/wantan/adctor/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 2. PostgreSQL起動

```bash
cd /Users/wantan/adctor
docker compose up -d postgres
```

`.env` の `DATABASE_URL` は以下にします。

```text
DATABASE_URL=postgresql+asyncpg://adctor:adctor@localhost:5432/adctor
```

## 3. DB migration

```bash
cd /Users/wantan/adctor/backend
source venv/bin/activate
alembic -c alembic.ini upgrade head
```

## 4. seed投入

```bash
cd /Users/wantan/adctor
backend/venv/bin/python backend/scripts/seed_hackii.py
```

## 5. API起動

```bash
cd /Users/wantan/adctor
backend/venv/bin/uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## 6. フロント起動

```bash
cd /Users/wantan/adctor/frontend
npm run dev
```

## 7. Perplexity実測

`.env` に以下を入れます。

```text
PERPLEXITY_API_KEY=...
PERPLEXITY_MODEL=sonar-pro
TASK_QUEUE_BACKEND=local
```

HackII画面で「手動計測を実行」を押します。

## 8. 確認項目

- `/api/v1/projects` がDBデータを返す
- 手動計測で `measurement_jobs` に `queued` が作られる
- ワーカー完了後に `succeeded` へ変わる
- `citation_results.citations_raw` にJSONBで生データが保存される
- 429時は `rate_limited` になり、該当エンジンだけ停止する

## 9. よくある失敗

| 症状 | 原因 | 対応 |
|---|---|---|
| `asyncpg` がない | 依存未インストール | `pip install -r requirements.txt` |
| DB接続できない | docker未起動 or URL違い | `docker compose ps` と `.env` を確認 |
| migrationが動かない | `backend` cwdで実行していない | `cd backend` して実行 |
| Perplexityが503 | APIキー未設定 | `PERPLEXITY_API_KEY` を設定 |
| 429が出る | API制限 | エンジン別キューの停止時間を確認 |
