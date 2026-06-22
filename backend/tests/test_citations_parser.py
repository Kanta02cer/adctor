import unittest

from backend.services.citations_parser import extract_citation_urls, parse_citations


class CitationParserTest(unittest.TestCase):
    def test_detects_target_and_competitor_domains(self) -> None:
        result = parse_citations(
            [
                "https://competitor-b.com/article/123",
                "https://other-site.com/blog/456",
                "https://client-a.com/family-trust",
            ],
            target_domain="client-a.com",
            competitor_domains=["competitor-b.com", "competitor-c.com"],
        )

        self.assertTrue(result.is_cited)
        self.assertEqual(result.cited_url, "https://client-a.com/family-trust")
        self.assertEqual(result.cited_position, 3)
        self.assertEqual(len(result.competitor_hits), 1)
        self.assertEqual(result.competitor_hits[0].domain, "competitor-b.com")

    def test_no_hit_keeps_result_empty(self) -> None:
        result = parse_citations(
            ["https://example.com/article"],
            target_domain="client-a.com",
            competitor_domains=["competitor-b.com"],
        )

        self.assertFalse(result.is_cited)
        self.assertIsNone(result.cited_url)
        self.assertIsNone(result.cited_position)
        self.assertEqual(result.own_hits, [])
        self.assertEqual(result.competitor_hits, [])

    def test_multiple_hits_use_first_target_position(self) -> None:
        result = parse_citations(
            [
                "https://competitor-b.com/a",
                "https://www.client-a.com/first",
                "https://blog.client-a.com/second",
            ],
            target_domain="client-a.com",
            competitor_domains=["competitor-b.com"],
        )

        self.assertTrue(result.is_cited)
        self.assertEqual(result.cited_url, "https://www.client-a.com/first")
        self.assertEqual(result.cited_position, 2)
        self.assertEqual(len(result.own_hits), 2)

    def test_domain_matching_is_case_insensitive_and_subdomain_safe(self) -> None:
        result = parse_citations(
            [
                "HTTPS://WWW.CLIENT-A.COM/UPPER",
                "https://client-a.com.evil.example/not-a-hit",
            ],
            target_domain="Client-A.com",
        )

        self.assertTrue(result.is_cited)
        self.assertEqual(result.cited_position, 1)
        self.assertEqual(len(result.own_hits), 1)

    def test_extracts_urls_from_perplexity_like_response_objects(self) -> None:
        urls = extract_citation_urls(
            {
                "citations": [
                    {"url": "https://client-a.com/a"},
                    {"source_url": "https://competitor-b.com/b"},
                    {"title": "missing url"},
                ]
            }
        )

        self.assertEqual(
            urls,
            ["https://client-a.com/a", "https://competitor-b.com/b"],
        )


if __name__ == "__main__":
    unittest.main()
