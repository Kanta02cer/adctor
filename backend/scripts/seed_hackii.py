import asyncio
import sys
from datetime import UTC, date, datetime
from pathlib import Path

from sqlalchemy import select

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from database import create_all_tables, get_sessionmaker
from models import Account, CitationResult, Competitor, CrawlerEvent, Keyword, PPCEvent, PPCPriceRule, Project
from services import AIEngine, parse_citations


async def main() -> None:
    await create_all_tables()
    session_factory = get_sessionmaker()
    async with session_factory() as session:
        existing = await session.execute(
            select(Project).where(Project.target_domain == "regalis-group.jp")
        )
        if existing.scalar_one_or_none() is not None:
            print("HackII seed data already exists.")
            return

        account = Account(name="Demo Agency", plan="agency")
        project = Project(
            account=account,
            name="株式会社Regalis Japan Group (スーツ・アパレル)",
            target_domain="regalis-group.jp",
        )
        project.competitors = [
            Competitor(domain="global-style.jp"),
            Competitor(domain="fabrictokyo.com"),
            Competitor(domain="hanabishi-house.co.jp"),
        ]

        keywords = [
            Keyword(
                keyword="オーダースーツ 東京 おすすめ",
                search_volume=9900,
                query_template="{keyword}について、主要な店舗と選び方を出典URL付きで教えてください。",
            ),
            Keyword(
                keyword="クラシック 高級スーツ 仕立て",
                search_volume=2400,
                query_template="{keyword}で評価されるブランドを出典URL付きで教えてください。",
            ),
            Keyword(
                keyword="ビジネス スーツ マナー 30代",
                search_volume=5400,
                query_template="{keyword}について、信頼できる出典URL付きで教えてください。",
            ),
        ]
        project.keywords = keywords
        session.add(account)
        await session.flush()

        samples = {
            "オーダースーツ 東京 おすすめ": {
                "answer_text": "東京でおすすめのオーダースーツ店として、Regalis Japan、Global Style、Fabric Tokyoが挙げられます。",
                "citations": [
                    "https://global-style.jp/shop/tokyo",
                    "https://regalis-group.jp/salon-tokyo",
                    "https://fabrictokyo.com/stores/ginza",
                    "https://hanabishi-house.co.jp/custom",
                ],
            },
            "クラシック 高級スーツ 仕立て": {
                "answer_text": "高級スーツの仕立てでは、Regalis Japanのビスポークラインが評価されています。",
                "citations": [
                    "https://regalis-group.jp/collections/executive",
                    "https://hanabishi-house.co.jp/heritage",
                    "https://global-style.jp/premium",
                ],
            },
            "ビジネス スーツ マナー 30代": {
                "answer_text": "30代のスーツマナーでは、無地ネイビーやチャコールグレーのジャストサイズが基本です。",
                "citations": [
                    "https://global-style.jp/style-guide/30s",
                    "https://fabrictokyo.com/blog/manner",
                ],
            },
        }

        competitor_domains = [competitor.domain for competitor in project.competitors]
        for keyword in keywords:
            sample = samples[keyword.keyword]
            parsed = parse_citations(
                sample["citations"],
                target_domain=project.target_domain,
                competitor_domains=competitor_domains,
            )
            session.add(
                CitationResult(
                    keyword=keyword,
                    ai_engine=AIEngine.PERPLEXITY.value,
                    snapshot_date=date.today(),
                    queried_at=datetime.now(UTC),
                    answer_text=sample["answer_text"],
                    citations_raw=sample["citations"],
                    is_cited=parsed.is_cited,
                    cited_url=parsed.cited_url,
                    cited_position=parsed.cited_position,
                )
            )

        crawler_event = CrawlerEvent(
            project=project,
            observed_at=datetime.now(UTC),
            source="seed",
            host="regalis-group.jp",
            path="/collections/executive",
            path_pattern="/collections/*",
            method="GET",
            status_code=402,
            request_count=842,
            bytes_transferred=314572800,
            detection_id="123815556",
            user_agent="GPTBot/1.0",
            crawler_name="GPTBot",
            operator="OpenAI",
            category="Training",
            verified=True,
            referrer_host=None,
            robots_status="allowed",
            policy_action="charge",
            risk_level="medium",
            raw_event={"source": "seed", "note": "PPC charge candidate"},
        )
        price_rule = PPCPriceRule(
            project=project,
            path_pattern="/collections/*",
            operator="OpenAI",
            crawler_name="GPTBot",
            category="Training",
            action="charge",
            currency="JPY",
            price_minor=8,
            priority=10,
            reason="商品・カテゴリ資産はPPC検証候補",
        )
        session.add_all([crawler_event, price_rule])
        await session.flush()
        session.add(
            PPCEvent(
                project=project,
                crawler_event=crawler_event,
                price_rule=price_rule,
                observed_at=datetime.now(UTC),
                crawler_name="GPTBot",
                operator="OpenAI",
                path="/collections/executive",
                status_code=402,
                decision="candidate",
                currency="JPY",
                rule_price_minor=8,
                crawler_max_price_minor=10,
                signature_status="valid",
                payment_header_signed=True,
                charge_status="not_attempted",
                rejection_reason=None,
                raw_event={"source": "seed", "payment_intent": "crawler-max-price"},
            )
        )

        await session.commit()
        print("HackII seed data inserted.")


if __name__ == "__main__":
    asyncio.run(main())
