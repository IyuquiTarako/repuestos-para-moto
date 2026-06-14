import ProductCardActions from "../components/product-card-actions";
import CartIndicator from "../components/cart-indicator";

type Product = {
	id: number;
	name: string;
	slug: string;
	price: number | string;
	stock: number;
	image_url: string | null;
	technical_sheet?: Record<string, string> | null;
	category?: {
		id: number;
		name: string;
		slug: string;
	};
};

type Category = {
	id: number;
	name: string;
	slug: string;
};

type ProductResponse =
	| Product[]
	| {
			items: Product[];
			total: number;
			skip: number;
			limit: number;
		};

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string): string {
	const value = searchParams[key];
	if (Array.isArray(value)) return value[0] ?? "";
	return value ?? "";
}

function buildProductsApiUrl(searchParams: SearchParams): string {
	const query = new URLSearchParams();
	const category = getParam(searchParams, "category");
	const minPrice = getParam(searchParams, "min_price");
	const maxPrice = getParam(searchParams, "max_price");
	const inStock = getParam(searchParams, "in_stock");
	const search = getParam(searchParams, "search");
	const moto = getParam(searchParams, "moto");

	query.set("limit", "60");
	if (category) query.set("category", category);
	if (minPrice) query.set("min_price", minPrice);
	if (maxPrice) query.set("max_price", maxPrice);
	if (inStock) query.set("in_stock", inStock);
	if (search) query.set("search", search);
	if (moto) query.set("moto", moto);

	return `http://127.0.0.1:8000/products?${query.toString()}`;
}

async function getProducts(searchParams: SearchParams): Promise<Product[]> {
	try {
		const response = await fetch(buildProductsApiUrl(searchParams), {
			cache: "no-store",
		});

		if (!response.ok) {
			return [];
		}

		const data: ProductResponse = await response.json();
		return Array.isArray(data) ? data : data.items;
	} catch {
		return [];
	}
}

async function getCategories(): Promise<Category[]> {
	try {
		const response = await fetch("http://127.0.0.1:8000/categories", {
			cache: "no-store",
		});
		if (!response.ok) return [];
		return (await response.json()) as Category[];
	} catch {
		return [];
	}
}

function formatCop(value: number | string): string {
	const asNumber = typeof value === "string" ? Number(value) : value;
	if (Number.isNaN(asNumber)) return "COP 0";
	return new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		maximumFractionDigits: 0,
	}).format(asNumber);
}

export default async function HomePage({ searchParams = {} }: { searchParams?: SearchParams }) {
	const products = await getProducts(searchParams);
	const categories = await getCategories();
	const selectedCategory = getParam(searchParams, "category");
	const selectedStock = getParam(searchParams, "in_stock");
	const selectedMoto = getParam(searchParams, "moto");
	const selectedSearch = getParam(searchParams, "search");
	const selectedMinPrice = getParam(searchParams, "min_price");
	const selectedMaxPrice = getParam(searchParams, "max_price");

	return (
		<main className="page">
			<a
				href="https://wa.me/573218055882?text=Hola!%20Quiero%20cotizar%20un%20repuesto%20para%20mi%20moto"
				className="btn-whatsapp-fixed"
				target="_blank"
				rel="noopener noreferrer"
			>
				<span className="wa-icon">WA</span>
				<span className="tooltip-wa">Cotiza por WhatsApp</span>
			</a>

			<header className="header">
				<div className="logo">
					AP GROUP <span>MOTOTECH</span>
				</div>
				<nav className="nav">
					<a href="#inicio" className="nav-link">
						Inicio
					</a>
					<a href="#catalogo" className="nav-link">
						Catalogo
					</a>
					<CartIndicator />
					<a href="/admin" className="btn-nav">
						Panel Admin
					</a>
				</nav>
			</header>

			<section id="inicio" className="hero">
				<div className="hero-content">
					<span className="badge">Envios a toda Colombia</span>
					<h1>
						POTENCIA Y RENDIMIENTO
						<br />
						<span className="text-gradient">PARA TU MAQUINA</span>
					</h1>
					<p>
						Repuestos de alto rendimiento, lujos y componentes premium para motos de bajo y alto
						cilindraje.
					</p>
					<div className="hero-buttons">
						<a
							href="https://wa.me/573218055882?text=Hola,%20necesito%20asesoria%20con%20un%20repuesto"
							target="_blank"
							rel="noopener noreferrer"
							className="btn-primary"
						>
							Hablar con un asesor
						</a>
						<a href="#catalogo" className="btn-secondary">
							Ver catalogo
						</a>
					</div>
				</div>
				<div className="neon-line" />
			</section>

			<section id="catalogo" className="categories">
				<div className="section-title">
					<h2>
						REPUESTOS <span>DISPONIBLES</span>
					</h2>
					<p>Datos reales desde la base de datos, filtrados en tiempo real</p>
				</div>

				<form className="filters" method="get" action="/">
					<div className="filter-grid">
						<label className="filter-item">
							<span>Palabra clave</span>
							<input name="search" defaultValue={selectedSearch} placeholder="Bujia, filtro, cadena..." />
						</label>

						<label className="filter-item">
							<span>Moto</span>
							<input name="moto" defaultValue={selectedMoto} placeholder="FZ, NS200, XTZ..." />
						</label>

						<label className="filter-item">
							<span>Categoria</span>
							<select name="category" defaultValue={selectedCategory}>
								<option value="">Todas</option>
								{categories.map((category) => (
									<option value={category.slug} key={category.id}>
										{category.name}
									</option>
								))}
							</select>
						</label>

						<label className="filter-item">
							<span>Disponibilidad</span>
							<select name="in_stock" defaultValue={selectedStock}>
								<option value="">Todas</option>
								<option value="true">En stock</option>
								<option value="false">Agotados</option>
							</select>
						</label>

						<label className="filter-item">
							<span>Precio minimo (COP)</span>
							<input name="min_price" type="number" min="0" defaultValue={selectedMinPrice} placeholder="0" />
						</label>

						<label className="filter-item">
							<span>Precio maximo (COP)</span>
							<input name="max_price" type="number" min="0" defaultValue={selectedMaxPrice} placeholder="500000" />
						</label>
					</div>

					<div className="filter-actions">
						<button type="submit" className="btn-filter-primary">
							Aplicar filtros
						</button>
						<a href="/#catalogo" className="btn-filter-secondary">
							Limpiar
						</a>
					</div>
				</form>

				<div className="grid-categories">
					{products.length === 0 && (
						<div className="empty-state">No hay productos cargados todavia. Agrega desde /admin.</div>
					)}

					{products.map((product, index) => {
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
											<p className="stock">
												Stock: <strong>{product.stock}</strong>
											</p>
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
			</section>

			<footer className="footer">
				<p>2026 MOTOTECH COLOMBIA - Pasion por las dos ruedas.</p>
			</footer>

			<style>{`
				@keyframes neonPulse {
					0%, 100% { box-shadow: 0 0 10px var(--accent-neon-glow), 0 0 20px rgba(255,85,0,0.2); }
					50% { box-shadow: 0 0 25px var(--accent-neon), 0 0 40px var(--accent-neon-glow); }
				}

				@keyframes waPulse {
					0%, 100% { box-shadow: 0 0 15px var(--wa-glow); transform: scale(1); }
					50% { box-shadow: 0 0 30px var(--wa-green); transform: scale(1.08); }
				}

				@keyframes float {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-6px); }
				}

				@keyframes slideUp {
					from { opacity: 0; transform: translateY(34px); }
					to { opacity: 1; transform: translateY(0); }
				}

				:root {
					--bg-dark: #0a0a0c;
					--bg-card: #141418;
					--accent-neon: #ff5500;
					--accent-neon-glow: rgba(255, 85, 0, 0.6);
					--text-light: #f1f1f5;
					--text-muted: #a0a0aa;
					--wa-green: #25d366;
					--wa-glow: rgba(37, 211, 102, 0.4);
				}

				* {
					box-sizing: border-box;
				}

				.page {
					background-color: var(--bg-dark);
					color: var(--text-light);
					font-family: Poppins, Segoe UI, sans-serif;
					min-height: 100vh;
				}

				.btn-whatsapp-fixed {
					position: fixed;
					bottom: 28px;
					right: 28px;
					background-color: var(--wa-green);
					color: #fff;
					width: 62px;
					height: 62px;
					border-radius: 50%;
					display: flex;
					justify-content: center;
					align-items: center;
					z-index: 999;
					text-decoration: none;
					box-shadow: 0 0 22px var(--wa-glow);
					animation: waPulse 3s infinite ease-in-out;
				}

				.wa-icon {
					font-size: 12px;
					font-weight: 800;
					letter-spacing: 1px;
				}

				.tooltip-wa {
					position: absolute;
					right: 72px;
					background: #111;
					border: 1px solid var(--wa-green);
					padding: 7px 10px;
					border-radius: 6px;
					font-size: 12px;
					white-space: nowrap;
					opacity: 0;
					transition: 0.2s;
				}

				.btn-whatsapp-fixed:hover .tooltip-wa {
					opacity: 1;
				}

				.header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 18px 8%;
					position: fixed;
					width: 100%;
					top: 0;
					background: rgba(10, 10, 12, 0.92);
					backdrop-filter: blur(8px);
					border-bottom: 1px solid rgba(255, 255, 255, 0.06);
					z-index: 100;
				}

				.logo {
					font-family: Orbitron, Segoe UI, sans-serif;
					font-weight: 800;
					letter-spacing: 1px;
				}

				.logo span {
					color: var(--accent-neon);
				}

				.nav {
					display: flex;
					gap: 24px;
					align-items: center;
				}

				.nav-link {
					color: var(--text-light);
					text-decoration: none;
					font-size: 14px;
				}

				.cart-indicator {
					position: relative;
					color: var(--text-light);
					text-decoration: none;
					font-size: 14px;
					font-weight: 700;
					padding-right: 18px;
				}

				.cart-badge {
					position: absolute;
					top: -10px;
					right: -2px;
					min-width: 20px;
					height: 20px;
					padding: 0 5px;
					border-radius: 999px;
					background: #dc2626;
					color: #fff;
					font-size: 12px;
					font-weight: 800;
					display: grid;
					place-items: center;
					box-shadow: 0 4px 14px rgba(220, 38, 38, 0.5);
					border: 1px solid rgba(255, 255, 255, 0.35);
				}

				.cart-popover {
					position: absolute;
					top: calc(100% + 12px);
					left: 50%;
					width: min(320px, calc(100vw - 24px));
					padding: 12px;
					border-radius: 12px;
					border: 1px solid rgba(255, 255, 255, 0.12);
					background: rgba(8, 10, 16, 0.95);
					box-shadow: 0 20px 45px rgba(0, 0, 0, 0.45);
					opacity: 0;
					transform: translate(-50%, 8px);
					pointer-events: none;
					transition: opacity 0.2s ease, transform 0.2s ease;
				}

				.cart-indicator:hover .cart-popover,
				.cart-indicator:focus-visible .cart-popover {
					opacity: 1;
					transform: translate(-50%, 0);
					pointer-events: auto;
				}

				.cart-preview-list {
					margin: 0;
					padding: 0;
					list-style: none;
					display: grid;
					gap: 8px;
				}

				.cart-preview-item {
					display: flex;
					justify-content: space-between;
					gap: 8px;
					font-size: 13px;
					padding-bottom: 8px;
					border-bottom: 1px solid rgba(255, 255, 255, 0.08);
				}

				.cart-preview-name {
					color: #e2e8f0;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.cart-preview-qty {
					color: #94a3b8;
					font-weight: 700;
				}

				.cart-total {
					margin: 10px 0 4px;
					font-size: 14px;
					font-weight: 800;
					color: #fb923c;
				}

				.cart-go {
					display: inline-block;
					font-size: 12px;
					color: #93c5fd;
				}

				.cart-empty,
				.cart-more {
					margin: 0;
					font-size: 13px;
					color: #94a3b8;
				}

				.btn-nav {
					border: 1px solid var(--accent-neon);
					color: var(--text-light);
					padding: 8px 14px;
					text-decoration: none;
					border-radius: 5px;
				}

				.hero {
					min-height: 88vh;
					background:
						radial-gradient(circle at 80% 20%, rgba(255, 85, 0, 0.17), transparent 42%),
						linear-gradient(rgba(10, 10, 12, 0.85), rgba(10, 10, 12, 0.95)),
						url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1600');
					background-size: cover;
					background-position: center;
					display: flex;
					align-items: center;
					padding: 100px 8% 40px;
					position: relative;
				}

				.hero-content {
					max-width: 720px;
					animation: slideUp 0.9s ease-out;
				}

				.badge {
					border: 1px solid var(--accent-neon);
					color: var(--accent-neon);
					padding: 6px 14px;
					border-radius: 999px;
					font-size: 12px;
					display: inline-block;
					margin-bottom: 20px;
				}

				h1 {
					font-family: Orbitron, Segoe UI, sans-serif;
					margin: 0 0 16px;
					font-size: clamp(33px, 6vw, 56px);
					line-height: 1.1;
				}

				.text-gradient {
					color: #fff;
					text-shadow: 0 0 16px rgba(255, 85, 0, 0.55);
				}

				.hero p {
					color: var(--text-muted);
					line-height: 1.7;
					max-width: 640px;
				}

				.hero-buttons {
					margin-top: 28px;
					display: flex;
					gap: 12px;
					flex-wrap: wrap;
				}

				.btn-primary,
				.btn-secondary {
					text-decoration: none;
					padding: 12px 20px;
					border-radius: 6px;
					font-weight: 700;
				}

				.btn-primary {
					background: var(--accent-neon);
					color: #fff;
					animation: neonPulse 2.5s infinite alternate;
				}

				.btn-secondary {
					border: 1px solid rgba(255, 255, 255, 0.2);
					color: var(--text-light);
				}

				.neon-line {
					position: absolute;
					bottom: 0;
					left: 0;
					width: 100%;
					height: 2px;
					background: linear-gradient(90deg, transparent, var(--accent-neon), transparent);
				}

				.categories {
					padding: 84px 8%;
				}

				.section-title {
					text-align: center;
					margin-bottom: 40px;
				}

				.section-title h2 {
					font-family: Orbitron, Segoe UI, sans-serif;
					letter-spacing: 1px;
				}

				.section-title h2 span {
					color: var(--accent-neon);
				}

				.section-title p {
					color: var(--text-muted);
				}

				.grid-categories {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
					gap: 22px;
				}

				.card {
					background: var(--bg-card);
					border: 1px solid rgba(255, 255, 255, 0.06);
					border-radius: 10px;
					overflow: hidden;
					transition: transform 0.2s ease;
					opacity: 0;
					animation: slideUp 0.55s ease forwards;
					position: relative;
				}

				.card:hover {
					transform: translateY(-4px);
					border-color: rgba(255, 85, 0, 0.5);
				}

				.card-img-placeholder {
					height: 380px;
					display: grid;
					place-items: center;
					background: linear-gradient(135deg, #222, #111);
					position: relative;
					overflow: hidden;
				}

				.card-link-cover {
					position: absolute;
					inset: 0;
					z-index: 1;
				}

				.card-overlay {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					padding: 14px;
					background: linear-gradient(to top, rgba(0, 0, 0, 0.92), rgba(0, 0, 0, 0.58), rgba(0, 0, 0, 0.18));
					z-index: 2;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					gap: 10px;
					pointer-events: none;
				}

				.card-meta {
					transition: opacity 0.22s ease, transform 0.22s ease;
				}

				.card-actions {
					pointer-events: auto;
					background: rgba(8, 10, 16, 0.78);
					border: 1px solid rgba(255, 255, 255, 0.18);
					border-radius: 10px;
					padding: 12px;
					backdrop-filter: blur(6px);
				}

				.card:hover .card-meta {
					opacity: 0;
					transform: translateY(8px);
				}

				.card:hover .product-img {
					transform: scale(1.08);
				}

				.card:hover .mechanical-icon {
					transform: scale(1.12);
				}

				.mechanical-icon {
					font-family: Orbitron, Segoe UI, sans-serif;
					font-size: 40px;
					color: #9ca3af;
					font-weight: 800;
					animation: float 4s infinite ease-in-out;
				}

				.card-meta h3,
				.card-meta .category,
				.card-meta .price,
				.card-meta .stock {
					text-shadow: 0 2px 8px rgba(0, 0, 0, 0.85);
				}

				.card-meta h3 {
					margin: 0 0 8px;
					display: inline-block;
					background: rgba(0, 0, 0, 0.62);
					padding: 7px 10px;
					border-radius: 8px;
					font-size: clamp(18px, 1.7vw, 24px);
					line-height: 1.22;
					max-width: 100%;
					backdrop-filter: blur(4px);
					word-break: break-word;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 3;
					-webkit-box-orient: vertical;
				}

				.card-body h3 {
					margin: 0 0 10px;
				}

				.price {
					color: var(--accent-neon);
					font-weight: 700;
					margin-bottom: 6px;
				}

				.stock {
					color: var(--text-muted);
					margin-bottom: 14px;
				}

				.btn-card {
					display: block;
					text-align: center;
					width: 100%;
					border: 1px solid rgba(255, 255, 255, 0.2);
					background: transparent;
					color: var(--text-light);
					padding: 10px;
					border-radius: 6px;
					font-weight: 700;
					cursor: pointer;
					text-decoration: none;
				}

				.btn-card:hover {
					border-color: var(--accent-neon);
					color: var(--accent-neon);
				}

				.btn-card-disabled {
					background: #4b5563;
					border-color: #4b5563;
					color: #d1d5db;
					cursor: not-allowed;
					pointer-events: none;
				}

				.btn-card-disabled:hover {
					color: #d1d5db;
				}

				.empty-state {
					border: 1px dashed rgba(255, 255, 255, 0.2);
					padding: 18px;
					border-radius: 10px;
					text-align: center;
					color: var(--text-muted);
					grid-column: 1 / -1;
				}

				.footer {
					border-top: 1px solid rgba(255, 255, 255, 0.08);
					text-align: center;
					padding: 28px;
					color: rgba(255, 255, 255, 0.45);
					font-size: 13px;
				}

				.filters {
					margin: 0 auto 30px;
					max-width: 1120px;
					border: 1px solid rgba(255, 255, 255, 0.09);
					background: linear-gradient(180deg, rgba(255, 85, 0, 0.07), rgba(20, 20, 24, 0.85));
					border-radius: 12px;
					padding: 16px;
				}

				.filter-grid {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
					gap: 10px;
				}

				.filter-item {
					display: grid;
					gap: 6px;
					font-size: 13px;
					font-weight: 700;
					color: #e2e8f0;
				}

				.filter-item input,
				.filter-item select {
					border: 1px solid #374151;
					background: #111827;
					color: #fff;
					padding: 10px 10px;
					border-radius: 8px;
				}

				.filter-actions {
					display: flex;
					gap: 8px;
					margin-top: 12px;
				}

				.btn-filter-primary,
				.btn-filter-secondary {
					padding: 10px 14px;
					border-radius: 8px;
					text-decoration: none;
					font-weight: 700;
					border: none;
					cursor: pointer;
				}

				.btn-filter-primary {
					background: #ff5500;
					color: #fff;
				}

				.btn-filter-secondary {
					background: #1f2937;
					color: #e5e7eb;
				}

				.product-img {
					width: 100%;
					height: 100%;
					object-fit: cover;
					transition: transform 0.35s ease;
				}

				.category {
					margin: 0 0 8px;
					font-size: 12px;
					font-weight: 700;
					color: #93c5fd;
					display: inline-block;
					background: rgba(0, 0, 0, 0.55);
					padding: 4px 8px;
					border-radius: 999px;
				}

				@media (max-width: 800px) {
					.nav {
						display: none;
					}

					.cart-popover {
						left: auto;
						right: 0;
						transform: translateY(8px);
					}

					.cart-indicator:hover .cart-popover,
					.cart-indicator:focus-visible .cart-popover {
						transform: translateY(0);
					}

					.card-img-placeholder {
						height: 360px;
					}

					.hero {
						min-height: 75vh;
						padding-top: 120px;
					}

					.btn-whatsapp-fixed {
						width: 55px;
						height: 55px;
						bottom: 18px;
						right: 18px;
					}
				}
			`}</style>
		</main>
	);
}
