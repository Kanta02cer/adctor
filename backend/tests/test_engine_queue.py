import asyncio
import unittest

from backend.services.engine_queue import (
    AIEngine,
    EngineRateLimitError,
    EngineTask,
    LocalEngineTaskQueue,
)


class LocalEngineTaskQueueTest(unittest.IsolatedAsyncioTestCase):
    async def test_rate_limit_pauses_only_target_engine(self) -> None:
        queue = LocalEngineTaskQueue()
        await queue.enqueue(AIEngine.PERPLEXITY, {"keyword_id": "kw-1"})
        await queue.enqueue(AIEngine.GEMINI, {"keyword_id": "kw-2"})
        await queue.enqueue(AIEngine.OPENAI, {"keyword_id": "kw-3"})

        processed: list[AIEngine] = []
        rate_limit_once = {AIEngine.PERPLEXITY}

        async def handler(task: EngineTask) -> None:
            if task.engine in rate_limit_once:
                rate_limit_once.remove(task.engine)
                raise EngineRateLimitError(task.engine, retry_after_seconds=30)
            processed.append(task.engine)

        first_drain = await queue.drain_ready(handler)

        self.assertEqual(processed, [AIEngine.GEMINI, AIEngine.OPENAI])
        self.assertEqual(first_drain.rate_limited, [AIEngine.PERPLEXITY])
        self.assertTrue(queue.is_paused(AIEngine.PERPLEXITY))
        self.assertFalse(queue.is_paused(AIEngine.GEMINI))
        self.assertFalse(queue.is_paused(AIEngine.OPENAI))
        self.assertEqual(queue.pending_count(AIEngine.PERPLEXITY), 1)
        self.assertEqual(queue.pending_count(AIEngine.GEMINI), 0)
        self.assertEqual(queue.pending_count(AIEngine.OPENAI), 0)

        await queue.resume_engine(AIEngine.PERPLEXITY)
        second_drain = await queue.drain_ready(handler)

        self.assertEqual([task.engine for task in second_drain.processed], [AIEngine.PERPLEXITY])
        self.assertEqual(processed, [AIEngine.GEMINI, AIEngine.OPENAI, AIEngine.PERPLEXITY])
        self.assertEqual(queue.pending_count(AIEngine.PERPLEXITY), 0)

    async def test_per_engine_concurrency_limit(self) -> None:
        queue = LocalEngineTaskQueue(
            max_concurrent_per_engine={
                AIEngine.GEMINI: 2,
            }
        )
        for index in range(3):
            await queue.enqueue(AIEngine.GEMINI, {"keyword_id": f"kw-{index}"})

        active = 0
        max_active = 0

        async def handler(task: EngineTask) -> None:
            nonlocal active, max_active
            active += 1
            max_active = max(max_active, active)
            await asyncio.sleep(0.01)
            active -= 1

        first_drain = await queue.drain_ready(handler, engines=[AIEngine.GEMINI])

        self.assertEqual(len(first_drain.processed), 2)
        self.assertEqual(max_active, 2)
        self.assertEqual(queue.pending_count(AIEngine.GEMINI), 1)

        second_drain = await queue.drain_ready(handler, engines=[AIEngine.GEMINI])

        self.assertEqual(len(second_drain.processed), 1)
        self.assertEqual(queue.pending_count(AIEngine.GEMINI), 0)


if __name__ == "__main__":
    unittest.main()
