from sqlalchemy import Column, ForeignKey, Integer, JSON, Numeric, String
from sqlalchemy.orm import relationship

from .database import Base


class Category(Base):
	__tablename__ = "categories"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(100), nullable=False)
	slug = Column(String(120), unique=True, index=True, nullable=False)

	products = relationship("Product", back_populates="category", cascade="all, delete-orphan")


class Product(Base):
	__tablename__ = "products"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(180), nullable=False)
	slug = Column(String(220), unique=True, index=True, nullable=False)
	category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
	price = Column(Numeric(12, 2), nullable=False)
	stock = Column(Integer, nullable=False, default=0)
	image_url = Column(String(500), nullable=True)
	technical_sheet = Column(JSON, nullable=True)

	category = relationship("Category", back_populates="products")
