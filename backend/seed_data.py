#!/usr/bin/env python
"""Seed script to populate database with sample products."""

import os
import sys
from datetime import datetime, timedelta

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, Base, engine
from app.models import Category, Product, Coupon

def seed_database():
    """Create tables and add sample data."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_count = db.query(Category).count()
        if existing_count > 0:
            print("Database already has data. Skipping seed.")
            return
        
        # Create categories
        categories = [
            Category(name="Frenos", slug="frenos"),
            Category(name="Motor", slug="motor"),
            Category(name="Accesorios", slug="accesorios"),
            Category(name="General", slug="general"),
            Category(name="Kit Arrastre", slug="kit-arrastre"),
            Category(name="Bujía", slug="bujia"),
            Category(name="Cadena", slug="cadena"),
            Category(name="Bombillo", slug="bombillo"),
        ]
        
        for category in categories:
            db.add(category)
        
        db.commit()
        
        # Create sample products
        products = [
            Product(
                name="Pastillas de Freno Brembo",
                slug="pastillas-freno-brembo",
                price=189900,
                stock=15,
                image_url="/productos/pastillas-brembo.jpg",
                category_id=1,
                technical_sheet={"Material": "Cerámica", "Compatible": "Todas las motos"}
            ),
            Product(
                name="Aceite de Motor Castrol",
                slug="aceite-motor-castrol",
                price=45000,
                stock=25,
                image_url="/productos/aceite-castrol.jpg",
                category_id=2,
                technical_sheet={"Tipo": "Sintético", "Viscosidad": "10W-40"}
            ),
            Product(
                name="Cadena 428 para Moto",
                slug="cadena-428",
                price=120000,
                stock=8,
                image_url="/productos/cadena-428.jpg",
                category_id=7,
                technical_sheet={"Tamaño": "428", "Largo": "140 eslabones"}
            ),
            Product(
                name="Bujía NGK Standard",
                slug="bujia-ngk",
                price=25000,
                stock=30,
                image_url="/productos/bujia-ngk.jpg",
                category_id=6,
                technical_sheet={"Referencia": "NGK R7", "Tipo": "Estándar"}
            ),
            Product(
                name="Espejos Cromados",
                slug="espejos-cromados",
                price=75000,
                stock=12,
                image_url="/productos/espejos.jpg",
                category_id=3,
                technical_sheet={"Acabado": "Cromo", "Tipo": "Universal"}
            ),
            Product(
                name="Manillar Deportivo",
                slug="manillar-deportivo",
                price=95000,
                stock=5,
                image_url="/productos/manillar.jpg",
                category_id=3,
                technical_sheet={"Material": "Aluminio", "Diámetro": "22mm"}
            ),
            Product(
                name="Filtro de Aire K&N",
                slug="filtro-aire-kn",
                price=155000,
                stock=10,
                image_url="/productos/filtro-aire.jpg",
                category_id=2,
                technical_sheet={"Marca": "K&N", "Tipo": "Deportivo"}
            ),
            Product(
                name="Bomba de Gasolina",
                slug="bomba-gasolina",
                price=280000,
                stock=3,
                image_url="/productos/bomba.jpg",
                category_id=2,
                technical_sheet={"Presión": "35-40 PSI", "Caudal": "85 L/h"}
            ),
        ]
        
        for product in products:
            db.add(product)
        
        db.commit()
        
        # Create sample coupons
        coupons = [
            Coupon(
                code="DESCUENTO10",
                discount_percent=10,
                max_uses=100,
                is_active=True,
                expiry_date=datetime.utcnow() + timedelta(days=30)
            ),
            Coupon(
                code="DESCUENTO20",
                discount_percent=20,
                max_uses=50,
                is_active=True,
                expiry_date=datetime.utcnow() + timedelta(days=30)
            ),
            Coupon(
                code="BIENVENIDA5",
                discount_percent=5,
                max_uses=200,
                is_active=True,
                expiry_date=datetime.utcnow() + timedelta(days=90)
            ),
        ]
        
        for coupon in coupons:
            db.add(coupon)
        
        db.commit()
        print("✅ Base de datos poblada con éxito!")
        print(f"   - {len(categories)} categorías agregadas")
        print(f"   - {len(products)} productos agregados")
        print(f"   - {len(coupons)} cupones agregados")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al poblar la base de datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
