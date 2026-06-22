import unittest

from backend.hackii_api import PPCDryRunRequest, _evaluate_ppc_dry_run, _select_ppc_rule
from backend.models import PPCPriceRule


class PPCDryRunTest(unittest.TestCase):
    def test_charge_rule_with_valid_payment_intent_becomes_candidate(self) -> None:
        rule = PPCPriceRule(
            path_pattern="/collections/*",
            action="charge",
            currency="JPY",
            price_minor=8,
        )
        result = _evaluate_ppc_dry_run(
            rule,
            PPCDryRunRequest(
                path="/collections/executive",
                crawler_name="GPTBot",
                verified=True,
                crawler_max_price_minor=10,
                signature_status="valid",
                payment_header_signed=True,
            ),
        )

        self.assertEqual(result["decision"], "candidate")
        self.assertEqual(result["status_code"], 402)
        self.assertEqual(result["charge_status"], "not_attempted")

    def test_unverified_crawler_is_not_chargeable(self) -> None:
        rule = PPCPriceRule(
            path_pattern="/blog/*",
            action="charge",
            currency="JPY",
            price_minor=4,
        )
        result = _evaluate_ppc_dry_run(
            rule,
            PPCDryRunRequest(
                path="/blog/style-guide",
                crawler_name="UnknownCrawler",
                verified=False,
                crawler_max_price_minor=10,
                signature_status="valid",
                payment_header_signed=True,
            ),
        )

        self.assertEqual(result["decision"], "blocked")
        self.assertEqual(result["status_code"], 403)
        self.assertEqual(result["reason"], "unverified crawler is not chargeable")

    def test_low_max_price_is_rejected(self) -> None:
        rule = PPCPriceRule(
            path_pattern="/whitepaper/*",
            action="charge",
            currency="JPY",
            price_minor=12,
        )
        result = _evaluate_ppc_dry_run(
            rule,
            PPCDryRunRequest(
                path="/whitepaper/robot-cost",
                crawler_name="VerifiedCrawler",
                verified=True,
                crawler_max_price_minor=8,
                signature_status="valid",
                payment_header_signed=True,
            ),
        )

        self.assertEqual(result["decision"], "rejected")
        self.assertEqual(result["status_code"], 402)

    def test_select_rule_matches_path_and_optional_identity(self) -> None:
        rules = [
            PPCPriceRule(path_pattern="/blog/*", action="review", priority=20),
            PPCPriceRule(path_pattern="/blog/*", operator="OpenAI", action="charge", priority=10),
        ]
        result = _select_ppc_rule(
            rules,
            path="/blog/style-guide",
            operator="openai",
            crawler_name="GPTBot",
            category=None,
        )

        self.assertIsNotNone(result)
        self.assertEqual(result.action, "charge")


if __name__ == "__main__":
    unittest.main()
