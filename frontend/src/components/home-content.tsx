"use client";

import { useState, useMemo } from "react";
import ProductCardActions from "@/components/product-card-actions";
import CartSidebar from "@/components/cart-sidebar";
import { useCart } from "@/components/cart-context";

type Product = {
	id: number;
	name: string;
	slug: string;
	price: number | string;
	stock: number;
	image_url: string | null;
	category?: {
		id: number;
		name: string;
		slug: string;
	};
};

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "popularity";

function formatCop(value: number | string): string {
	const asNumber = typeof value === "string" ? Number(value) : value;
	if (Number.isNaN(asNumber)) return "COP 0";
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		maximumFractionDigits: 0,
	}).format(asNumber);
}

type Props = {
	products: Product[];
	categories: Array<{ id: number; name: string; slug: string }>;
};

export function HomeContent({ products, categories }: Props) {
	const { items, total, isDrawerOpen, closeDrawer } = useCart();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("name-asc");

	const filteredProducts = useMemo(() => {
		let result = [...products];

		// Filtrar por búsqueda
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			result = result.filter(
				(p) =>
					p.name.toLowerCase().includes(term) ||
					p.slug.toLowerCase().includes(term) ||
					p.category?.name.toLowerCase().includes(term)
			);
		}

		// Filtrar por categoría
		if (selectedCategory) {
			result = result.filter((p) => p.category?.slug === selectedCategory);
		}

		// Ordenar
		switch (sortBy) {
			case "name-asc":
				result.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case "name-desc":
				result.sort((a, b) => b.name.localeCompare(a.name));
				break;
			case "price-asc":
				result.sort((a, b) => Number(a.price) - Number(b.price));
				break;
			case "price-desc":
				result.sort((a, b) => Number(b.price) - Number(a.price));
				break;
			case "popularity":
				// TODO: Implementar con sales_count del backend
				result.sort((a, b) => a.name.localeCompare(b.name));
				break;
		}

		return result;
	}, [products, searchTerm, selectedCategory, sortBy]);

	return (
		<>
			<CartSidebar isOpen={isDrawerOpen} onClose={closeDrawer} items={items} total={total} />

			<div className="catalog-controls">
				<input
					type="text"
					placeholder="Buscar productos (nombre, categoría, compatibilidad)..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="catalog-search-input"
				/>

				<div className="catalog-filters-row">
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="catalog-filter-select"
					>
						<option value="">Todas las categorías</option>
						{categories.map((cat) => (
							<option key={cat.id} value={cat.slug}>
								{cat.name}
							</option>
						))}
					</select>

					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as SortOption)}
						className="catalog-filter-select"
					>
						<option value="name-asc">A-Z (predeterminado)</option>
						<option value="name-desc">Z-A</option>
						<option value="price-asc">Precio: menor a mayor</option>
						<option value="price-desc">Precio: mayor a menor</option>
						<option value="popularity">Más vendidos</option>
					</select>

					{(searchTerm || selectedCategory) && (
						<button
							onClick={() => {
								setSearchTerm("");
								setSelectedCategory("");
								setSortBy("name-asc");
							}}
							className="catalog-reset-btn"
						>
							Limpiar filtros
						</button>
					)}
				</div>

				{filteredProducts.length === 0 && (
					<p className="catalog-no-results">
						No encontramos productos que coincidan con tu búsqueda. Intenta con otros términos.
					</p>
				)}

				<p className="catalog-results-count">{filteredProducts.length} productos encontrados</p>
			</div>

			<div className="grid-categories">
				{filteredProducts.map((product, index) => {
					return (
						<article className="card" key={product.id} style={{ animationDelay: `${index * 80}ms` }}>
							<div className="card-img-placeholder">
								<a
									href={`/productos/${product.slug}`}
									className="card-link-cover"
									aria-label={`Ver ficha tecnica de ${product.name}`}
								/>

								{product.image_url ? (
									<img className="product-img" src={product.image_url} alt={product.name} />
								) : (
									<span className="mechanical-icon">{product.name.slice(0, 1).toUpperCase()}</span>
								)}

								<div className="card-overlay">
									<div className="card-meta">
										<h3>{product.name}</h3>
										<p className="category">{product.category?.name ?? "General"}</p>
										<p className="price">{formatCop(product.price)}</p>
									</div>

									<div className="card-actions">
										<ProductCardActions
											product={{
												id: product.id,
												name: product.name,
												slug: product.slug,
												price: Number(product.price),
												stock: product.stock,
											}}
										/>
									</div>
								</div>
							</div>
						</article>
					);
				})}
			</div>
		</>
	);
}
