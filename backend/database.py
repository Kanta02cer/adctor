import os
from collections.abc import AsyncGenerator
from functools import lru_cache

from dotenv import load_dotenv
from sqlalchemy import MetaData
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

POSTGRES_NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=POSTGRES_NAMING_CONVENTION)


def normalize_database_url(raw_url: str) -> str:
    """Accept common PostgreSQL URLs and force SQLAlchemy's asyncpg driver."""
    url = make_url(raw_url)
    if url.drivername in {"postgresql", "postgres"}:
        return str(url.set(drivername="postgresql+asyncpg"))
    if url.drivername in {"postgresql+psycopg2", "postgresql+pg8000"}:
        return str(url.set(drivername="postgresql+asyncpg"))
    return raw_url


DATABASE_URL = normalize_database_url(
    os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/adctor",
    )
)


@lru_cache(maxsize=1)
def get_engine() -> AsyncEngine:
    return create_async_engine(
        DATABASE_URL,
        echo=os.getenv("SQLALCHEMY_ECHO", "").lower() in {"1", "true", "yes"},
        pool_pre_ping=True,
    )


@lru_cache(maxsize=1)
def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        bind=get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    session_factory = get_sessionmaker()
    async with session_factory() as session:
        yield session


async def create_all_tables() -> None:
    try:
        from . import models  # noqa: F401
    except ImportError:
        import models  # type: ignore # noqa: F401

    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
