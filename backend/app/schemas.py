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


class UserOut(BaseModel):
	id: int
	email: str
	username: str
	is_admin: bool
	is_active: bool

	model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
	email: str
	username: str
	password: str


class UserLogin(BaseModel):
	email: str
	password: str


class AuthToken(BaseModel):
	access_token: str
	token_type: str
	user: UserOut

class CouponOut(BaseModel):
    id: int
    code: str
    discount_percent: int
    is_active: bool
    times_used: int

    model_config = ConfigDict(from_attributes=True)


class CouponCreate(BaseModel):
    code: str
    discount_percent: int
    max_uses: int | None = None