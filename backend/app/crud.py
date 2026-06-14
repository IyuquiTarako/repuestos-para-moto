from sqlalchemy import String, cast
from sqlalchemy.orm import Session, joinedload

from . import models


def get_categories(db: Session) -> list[models.Category]:
	return db.query(models.Category).order_by(models.Category.id.asc()).all()


def get_category_by_slug(db: Session, slug: str) -> models.Category | None:
	return db.query(models.Category).filter(models.Category.slug == slug).first()


def create_category(db: Session, name: str, slug: str) -> models.Category:
	category = models.Category(name=name, slug=slug)
	db.add(category)
	db.commit()
	db.refresh(category)
	return category


def get_category_by_id(db: Session, category_id: int) -> models.Category | None:
	return db.get(models.Category, category_id)


def update_category(db: Session, category: models.Category, payload: dict) -> models.Category:
	for key, value in payload.items():
		setattr(category, key, value)
	db.commit()
	db.refresh(category)
	return category


def delete_category(db: Session, category: models.Category) -> None:
	db.delete(category)
	db.commit()


def _products_query(
	db: Session,
	category_slug: str | None = None,
	min_price: float | None = None,
	max_price: float | None = None,
	in_stock: bool | None = None,
	search: str | None = None,
	moto: str | None = None,
):
	query = db.query(models.Product)

	if category_slug:
		query = query.join(models.Category).filter(models.Category.slug == category_slug)
	if min_price is not None:
		query = query.filter(models.Product.price >= min_price)
	if max_price is not None:
		query = query.filter(models.Product.price <= max_price)
	if in_stock is True:
		query = query.filter(models.Product.stock > 0)
	elif in_stock is False:
		query = query.filter(models.Product.stock <= 0)
	if search:
		query = query.filter(models.Product.name.ilike(f"%{search}%"))
	if moto:
		query = query.filter(cast(models.Product.technical_sheet, String).ilike(f"%{moto}%"))

	return query


def get_products(
	db: Session,
	skip: int = 0,
	limit: int = 20,
	category_slug: str | None = None,
	min_price: float | None = None,
	max_price: float | None = None,
	in_stock: bool | None = None,
	search: str | None = None,
	moto: str | None = None,
) -> list[models.Product]:
	query = _products_query(
		db,
		category_slug=category_slug,
		min_price=min_price,
		max_price=max_price,
		in_stock=in_stock,
		search=search,
		moto=moto,
	).options(joinedload(models.Product.category))

	return query.order_by(models.Product.id.desc()).offset(skip).limit(limit).all()


def count_products(
	db: Session,
	category_slug: str | None = None,
	min_price: float | None = None,
	max_price: float | None = None,
	in_stock: bool | None = None,
	search: str | None = None,
	moto: str | None = None,
) -> int:
	query = _products_query(
		db,
		category_slug=category_slug,
		min_price=min_price,
		max_price=max_price,
		in_stock=in_stock,
		search=search,
		moto=moto,
	)
	return query.count()


def get_product_by_slug(db: Session, slug: str) -> models.Product | None:
	return (
		db.query(models.Product)
		.options(joinedload(models.Product.category))
		.filter(models.Product.slug == slug)
		.first()
	)


def get_product_by_id(db: Session, product_id: int) -> models.Product | None:
	return db.get(models.Product, product_id)


def create_product(db: Session, payload: dict) -> models.Product:
	product = models.Product(**payload)
	db.add(product)
	db.commit()
	db.refresh(product)
	return product


def update_product(db: Session, product: models.Product, payload: dict) -> models.Product:
	for key, value in payload.items():
		setattr(product, key, value)
	db.commit()
	db.refresh(product)
	return product


def delete_product(db: Session, product: models.Product) -> None:
	db.delete(product)
	db.commit()
