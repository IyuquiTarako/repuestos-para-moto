from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict


class CategoryOut(BaseModel):
	id: int
	name: str
	slug: str

	model_config = ConfigDict(from_attributes=True)


class CategoryCreate(BaseModel):
	name: str
	slug: str


class CategoryUpdate(BaseModel):
	name: str | None = None
	slug: str | None = None


class ProductOut(BaseModel):
	id: int
	name: str
	slug: str
	category_id: int
	price: Decimal
	stock: int
	image_url: str | None = None
	technical_sheet: dict[str, Any] | None = None
	category: CategoryOut

	model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
	name: str
	slug: str | None = None
	category_id: int | None = None
	price: Decimal
	stock: int = 0
	image_url: str | None = None
	technical_sheet: dict[str, Any] | None = None


class ProductUpdate(BaseModel):
	name: str | None = None
	slug: str | None = None
	category_id: int | None = None
	price: Decimal | None = None
	stock: int | None = None
	image_url: str | None = None
	technical_sheet: dict[str, Any] | None = None


class ProductListResponse(BaseModel):
	items: list[ProductOut]
	total: int
	skip: int
	limit: int
