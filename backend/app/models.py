from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, Numeric, String, Boolean
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
	sales_count = Column(Integer, nullable=False, default=0)

	category = relationship("Category", back_populates="products")


class Coupon(Base):
	__tablename__ = "coupons"

	id = Column(Integer, primary_key=True, index=True)
	code = Column(String(50), unique=True, index=True, nullable=False)
	discount_percent = Column(Integer, nullable=False)
	max_uses = Column(Integer, nullable=True)
	times_used = Column(Integer, default=0)
	is_active = Column(Boolean, default=True)
	expiry_date = Column(DateTime, nullable=True)
	created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
	__tablename__ = "users"

	id = Column(Integer, primary_key=True, index=True)
	email = Column(String(255), unique=True, index=True, nullable=False)
	username = Column(String(120), nullable=False)
	hashed_password = Column(String(255), nullable=False)
	is_admin = Column(Boolean, default=False)
	is_active = Column(Boolean, default=True)
