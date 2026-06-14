import os
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
	"DATABASE_URL",
	"postgresql+psycopg2://postgres:postgres@localhost:5432/mototech_db",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator:
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
