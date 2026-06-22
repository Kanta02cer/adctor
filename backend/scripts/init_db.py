import asyncio
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from database import create_all_tables


async def main() -> None:
    await create_all_tables()


if __name__ == "__main__":
    asyncio.run(main())
