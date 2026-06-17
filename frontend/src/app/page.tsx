import ProductCardActions from "../components/product-card-actions";
import SiteHeader from "../components/site-header";
import { HomeContent } from "../components/home-content";

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

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const resolvedSearchParams = await searchParams;
	const products = await getProducts(resolvedSearchParams);
	const categories = await getCategories();
	const selectedCategory = getParam(resolvedSearchParams, "category");
	const selectedStock = getParam(resolvedSearchParams, "in_stock");
	const selectedMoto = getParam(resolvedSearchParams, "moto");
	const selectedSearch = getParam(resolvedSearchParams, "search");
	const selectedMinPrice = getParam(resolvedSearchParams, "min_price");
	const selectedMaxPrice = getParam(resolvedSearchParams, "max_price");

	return (
		<main className="page">
			<a
				href="https://wa.me/573218055882?text=Hola!%20Quiero%20cotizar%20un%20repuesto%20para%20mi%20moto"
				className="btn-whatsapp-fixed"
				target="_blank"
				rel="noopener noreferrer"
			>
				<span className="wa-icon" aria-hidden="true">
					<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M12.04 2C6.56 2 2.11 6.45 2.11 11.93c0 1.93.55 3.8 1.6 5.41L2 22l4.82-1.65a9.9 9.9 0 0 0 5.2 1.47h.01c5.48 0 9.93-4.45 9.93-9.93A9.93 9.93 0 0 0 12.04 2Zm5.78 14.05c-.24.68-1.36 1.29-1.87 1.32-.48.03-1.08.04-1.75-.18-.4-.13-.91-.3-1.57-.58-2.77-1.2-4.57-4.01-4.7-4.2-.13-.18-1.12-1.49-1.12-2.85 0-1.36.72-2.03.97-2.31.26-.28.56-.35.75-.35h.54c.17 0 .4-.06.62.47.24.57.82 1.98.89 2.12.07.15.12.33.02.53-.1.2-.15.33-.31.5-.16.19-.33.41-.47.55-.16.16-.33.34-.14.67.2.33.88 1.45 1.89 2.35 1.3 1.15 2.39 1.5 2.73 1.67.33.16.52.14.72-.08.2-.22.85-.99 1.07-1.33.23-.34.45-.28.76-.17.31.11 1.98.93 2.32 1.1.34.16.56.24.64.37.08.13.08.76-.16 1.45Z" />
					</svg>
				</span>
				<span className="tooltip-wa">Cotiza por WhatsApp</span>
			</a>

			<SiteHeader showAdmin />

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

				<HomeContent products={products} categories={categories} />
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
					display: inline-flex;
					align-items: center;
					justify-content: center;
					line-height: 0;
				}

				.wa-icon svg {
					display: block;
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
					display: inline-grid;
					place-items: center;
					line-height: 0;
					padding: 0;
					width: 40px;
					height: 40px;
					border-radius: 999px;
					border: 1px solid rgba(255, 255, 255, 0.24);
					color: #fefefe;
					background: rgba(255, 255, 255, 0.05);
					text-decoration: none;
					transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
				}

				.cart-indicator:hover {
					transform: translateY(-2px);
					border-color: var(--accent-neon);
					background: rgba(255, 106, 0, 0.12);
				}

				.cart-icon {
					position: absolute;
					inset: 0;
					display: grid;
					place-items: center;
					line-height: 0;
					pointer-events: none;
				}

				.cart-icon svg {
					display: block;
					width: 18px;
					height: 18px;
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
					gap: 7px;
				}

				.cart-popover-title {
					margin: 0 0 10px;
					font-size: 13px;
					font-weight: 800;
					color: #e2e8f0;
					letter-spacing: 0.2px;
				}

				.cart-preview-item {
					display: grid;
					grid-template-columns: minmax(0, 1fr) auto;
					gap: 12px;
					align-items: start;
					font-size: 13px;
					padding: 8px;
					border-radius: 8px;
					background: rgba(255, 255, 255, 0.04);
				}

				.cart-preview-main {
					flex: 1;
					min-width: 0;
					display: grid;
					gap: 3px;
				}

				.cart-preview-name {
					display: block;
					font-weight: 600;
					color: #f8fafc;
					white-space: normal;
					line-height: 1.25;
					word-break: break-word;
				}

				.cart-preview-meta {
					display: block;
					color: #94a3b8;
					font-size: 12px;
					line-height: 1.3;
				}

				.cart-preview-subtotal {
					align-self: start;
					color: #fbbf24;
					font-weight: 700;
					white-space: nowrap;
				}

				.cart-total {
					display: block;
					margin: 12px 0 0;
					padding-top: 10px;
					border-top: 1px solid rgba(255, 255, 255, 0.12);
					font-size: 14px;
					font-weight: 800;
					color: #fb923c;
				}

				.cart-go {
					display: inline-block;
					margin-top: 6px;
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
					height: 360px;
					display: grid;
					place-items: center;
					background: #ffffff;
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
					object-fit: contain;
					padding: 12px;
					background: #ffffff;
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
						height: 320px;
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
