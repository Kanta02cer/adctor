import unittest

import httpx

from backend.services.perplexity_client import (
    PerplexityClient,
    PerplexityConfig,
    PerplexityRateLimitError,
    build_prompt,
)


class PerplexityClientTest(unittest.IsolatedAsyncioTestCase):
    async def test_ask_extracts_answer_and_citations(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(
                200,
                json={
                    "choices": [{"message": {"content": "answer text"}}],
                    "citations": ["https://client-a.com/a", "https://competitor.com/b"],
                },
            )

        transport = httpx.MockTransport(handler)
        original_client = httpx.AsyncClient

        def mock_client(*args, **kwargs):
            kwargs["transport"] = transport
            return original_client(*args, **kwargs)

        httpx.AsyncClient = mock_client
        try:
            client = PerplexityClient(
                PerplexityConfig(
                    api_key="test-key",
                    model="sonar-pro",
                    base_url="https://api.perplexity.ai",
                )
            )
            response = await client.ask(prompt="test")
        finally:
            httpx.AsyncClient = original_client

        self.assertEqual(response.answer_text, "answer text")
        self.assertEqual(response.citations, ["https://client-a.com/a", "https://competitor.com/b"])
        self.assertEqual(response.raw_response["choices"][0]["message"]["content"], "answer text")

    async def test_ask_raises_rate_limit_with_retry_after(self) -> None:
        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(429, headers={"retry-after": "45"}, json={"error": "too many"})

        transport = httpx.MockTransport(handler)
        original_client = httpx.AsyncClient

        def mock_client(*args, **kwargs):
            kwargs["transport"] = transport
            return original_client(*args, **kwargs)

        httpx.AsyncClient = mock_client
        try:
            client = PerplexityClient(PerplexityConfig(api_key="test-key"))
            with self.assertRaises(PerplexityRateLimitError) as error:
                await client.ask(prompt="test")
        finally:
            httpx.AsyncClient = original_client

        self.assertEqual(error.exception.retry_after_seconds, 45)

    def test_build_prompt_replaces_keyword_placeholder(self) -> None:
        self.assertEqual(
            build_prompt("家族信託", "{keyword}の費用を教えて"),
            "家族信託の費用を教えて",
        )


if __name__ == "__main__":
    unittest.main()
