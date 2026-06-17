import os
import re
import hashlib
import secrets

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import Base, engine, get_db

app = FastAPI(title="MotoTech API")

app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:3000",
		"http://127.0.0.1:3000",
	],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "mototech-admin-token")


def hash_password(password: str) -> str:
	salt = secrets.token_hex(16)
	pwdhash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000)
	return f"{salt}${pwdhash.hex()}"


def verify_password(password: str, hashed: str) -> bool:
	try:
		salt, pwdhash = hashed.split("$")
		return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex() == pwdhash
	except ValueError:
		return False


@app.on_event("startup")
def on_startup() -> None:
	Base.metadata.create_all(bind=engine)


def require_admin(x_admin_token: str | None = Header(default=None, alias="X-Admin-Token")) -> None:
	if x_admin_token != ADMIN_TOKEN:
		raise HTTPException(status_code=401, detail="Invalid admin token")


@app.get("/products", response_model=schemas.ProductListResponse)
def list_products(
	skip: int = Query(default=0, ge=0),
	limit: int = Query(default=20, ge=1, le=100),
	category: str | None = Query(default=None),
	min_price: float | None = Query(default=None, ge=0),
	max_price: float | None = Query(default=None, ge=0),
	in_stock: bool | None = Query(default=None),
	search: str | None = Query(default=None),
	moto: str | None = Query(default=None),
	db: Session = Depends(get_db),
):
	if min_price is not None and max_price is not None and min_price > max_price:
		raise HTTPException(status_code=400, detail="min_price cannot be greater than max_price")
	items = crud.get_products(
		db,
		skip=skip,
		limit=limit,
		category_slug=category,
		min_price=min_price,
		max_price=max_price,
		in_stock=in_stock,
		search=search,
		moto=moto,
	)
	total = crud.count_products(
		db,
		category_slug=category,
		min_price=min_price,
		max_price=max_price,
		in_stock=in_stock,
		search=search,
		moto=moto,
	)
	return {"items": items, "total": total, "skip": skip, "limit": limit}


@app.get("/products/{slug}", response_model=schemas.ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
	product = crud.get_product_by_slug(db, slug)
	if not product:
		raise HTTPException(status_code=404, detail="Product not found")
	return product


@app.get("/categories", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
	return crud.get_categories(db)


@app.post("/categories", response_model=schemas.CategoryOut, status_code=201)
def create_category(
	payload: schemas.CategoryCreate,
	db: Session = Depends(get_db),
	_: None = Depends(require_admin),
):
	existing = crud.get_category_by_slug(db, payload.slug)
	if existing:
		raise HTTPException(status_code=409, detail="Category slug already exists")
	return crud.create_category(db, name=payload.name, slug=payload.slug)


@app.put("/categories/{category_id}", response_model=schemas.CategoryOut)
def update_category(
	category_id: int,
	payload: schemas.CategoryUpdate,
	db: Session = Depends(get_db),
	_: None = Depends(require_admin),
):
	category = crud.get_category_by_id(db, category_id)
	if not category:
		raise HTTPException(status_code=404, detail="Category not found")
	data = payload.model_dump(exclude_unset=True)
	if "slug" in data:
		existing = crud.get_category_by_slug(db, data["slug"])
		if existing and existing.id != category.id:
			raise HTTPException(status_code=409, detail="Category slug already exists")
	return crud.update_category(db, category, data)


@app.delete("/categories/{category_id}", status_code=204)
def delete_category(
	category_id: int,
	db: Session = Depends(get_db),
	_: None = Depends(require_admin),
):
	category = crud.get_category_by_id(db, category_id)
	if not category:
		raise HTTPException(status_code=404, detail="Category not found")
	crud.delete_category(db, category)
	return None


@app.post("/products", response_model=schemas.ProductOut, status_code=201)
def create_product(
	payload: schemas.ProductCreate,
	db: Session = Depends(get_db),
	_: None = Depends(require_admin),
):
	data = payload.model_dump(exclude_unset=True)

	# If no category is provided, use (or create) a default category for quick admin loading.
	if not data.get("category_id"):
		default_category = crud.get_category_by_slug(db, "general")
		if not default_category:
			default_category = crud.create_category(db, name="General", slug="general")
		data["category_id"] = default_category.id
	elif not db.get(models.Category, data["category_id"]):
		raise HTTPException(status_code=404, detail="Category not found")

	# Generate a URL-friendly slug from the product name when omitted.
	if not data.get("slug"):
		base_slug = re.sub(r"[^a-z0-9]+", "-", payload.name.lower()).strip("-") or "producto"
		slug_candidate = base_slug
		suffix = 2
		while crud.get_product_by_slug(db, slug_candidate):
			slug_candidate = f"{base_slug}-{suffix}"
			suffix += 1
		data["slug"] = slug_candidate
	elif crud.get_product_by_slug(db, data["slug"]):
		raise HTTPException(status_code=409, detail="Product slug already exists")

	return crud.create_product(db, payload=data)


@app.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(
	product_id: int,
	payload: schemas.ProductUpdate,
	db: Session = Depends(get_db),
	_: None = Depends(require_admin),
):
	product = crud.get_product_by_id(db, product_id)
	if not product:
		raise HTTPException(status_code=404, detail="Product not found")
	data = payload.model_dump(exclude_unset=True)
	if "category_id" in data and not db.get(models.Category, data["category_id"]):
		raise HTTPException(status_code=404, detail="Category not found")
	if "slug" in data:
		existing = crud.get_product_by_slug(db, data["slug"])
		if existing and existing.id != product.id:
			raise HTTPException(status_code=409, detail="Product slug already exists")
	return crud.update_product(db, product, data)


@app.delete("/products/{product_id}", status_code=204)
def delete_product(
	product_id: int,
	db: Session = Depends(get_db),
	_: None = Depends(require_admin),
):
	product = crud.get_product_by_id(db, product_id)
	if not product:
		raise HTTPException(status_code=404, detail="Product not found")
	crud.delete_product(db, product)
	return None


@app.post("/auth/register", response_model=schemas.UserOut, status_code=201)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
	existing_user = crud.get_user_by_email(db, payload.email)
	if existing_user:
		raise HTTPException(status_code=409, detail="Email already registered")
	
	hashed = hash_password(payload.password)
	user = crud.create_user(db, email=payload.email, username=payload.username, hashed_password=hashed, is_admin=False)
	return user


@app.post("/auth/login", response_model=schemas.AuthToken)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
	user = crud.get_user_by_email(db, payload.email)
	if not user or not verify_password(payload.password, user.hashed_password):
		raise HTTPException(status_code=401, detail="Invalid credentials")
	
	if not user.is_active:
		raise HTTPException(status_code=403, detail="User is inactive")
	
	token = secrets.token_urlsafe(32)
	return {
		"access_token": token,
		"token_type": "bearer",
		"user": schemas.UserOut.model_validate(user),
	}


@app.post("/products/{product_id}/sale", response_model=schemas.ProductOut)
def confirm_product_sale(
	product_id: int,
	quantity: int = Query(default=1, ge=1),
	db: Session = Depends(get_db),
	_: None = Depends(require_admin),
):
	product = crud.get_product_by_id(db, product_id)
	if not product:
		raise HTTPException(status_code=404, detail="Product not found")
	
	return crud.update_product_sales(db, product, increment=quantity)


@app.post("/coupons/validate")
def validate_coupon(code: str = Query(...), db: Session = Depends(get_db)):
	"""Validate a coupon code and return discount percentage."""
	is_valid, discount_percent = crud.validate_coupon(db, code)
	
	if not is_valid:
		raise HTTPException(status_code=404, detail="Invalid or expired coupon")
	
	return {"valid": True, "discount_percent": discount_percent}
