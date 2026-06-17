import { notFound } from "next/navigation";

import AddToCartButton from "../../../components/add-to-cart-button";
import RecommendedCarousel from "../../../components/recommended-carousel";
import SiteHeader from "../../../components/site-header";

type ProductDetail = {
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

type ProductListItem = {
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
  technical_sheet?: Record<string, string> | null;
};

type ProductResponse =
  | ProductListItem[]
  | {
      items: ProductListItem[];
      total: number;
      skip: number;
      limit: number;
    };

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/products/${slug}`, {
      cache: "no-store",
    });

    if (response.status === 404) return null;
    if (!response.ok) return null;

    return (await response.json()) as ProductDetail;
  } catch {
    return null;
  }
}

async function getProductsByQuery(query: URLSearchParams): Promise<ProductListItem[]> {
  try {
    const response = await fetch(`http://127.0.0.1:8000/products?${query.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) return [];
    const data: ProductResponse = await response.json();
    return Array.isArray(data) ? data : data.items;
  } catch {
    return [];
  }
}

function getMotoHint(technicalSheet?: Record<string, string> | null): string {
  if (!technicalSheet) return "";

  const entry = Object.entries(technicalSheet).find(([key]) =>
    /moto|compat|aplica|vehiculo|modelo/i.test(key)
  );
  if (!entry) return "";

  const cleaned = String(entry[1] ?? "").trim();
  if (!cleaned) return "";
  return cleaned.split(/[,|/]/).map((part) => part.trim()).find(Boolean) ?? "";
}

async function getRecommendedProducts(product: ProductDetail): Promise<ProductListItem[]> {
  const byId = new Map<number, ProductListItem>();

  if (product.category?.slug) {
    const categoryQuery = new URLSearchParams();
    categoryQuery.set("limit", "10");
    categoryQuery.set("category", product.category.slug);
    const sameCategory = await getProductsByQuery(categoryQuery);
    for (const item of sameCategory) {
      if (item.slug !== product.slug) byId.set(item.id, item);
    }
  }

  if (byId.size < 6) {
    const motoHint = getMotoHint(product.technical_sheet);
    if (motoHint) {
      const motoQuery = new URLSearchParams();
      motoQuery.set("limit", "10");
      motoQuery.set("moto", motoHint);
      const sameMoto = await getProductsByQuery(motoQuery);
      for (const item of sameMoto) {
        if (item.slug !== product.slug) byId.set(item.id, item);
      }
    }
  }

  return Array.from(byId.values()).slice(0, 12);
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

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const technicalEntries = Object.entries(product.technical_sheet ?? {});
  const recommendedProducts = await getRecommendedProducts(product);

  return (
    <main className="product-page">
      <SiteHeader />

      <div className="product-wrap">
        <nav className="product-breadcrumb" aria-label="Ruta de navegacion">
          <a href="/">Inicio</a>
          <span>/</span>
          <a href="/#catalogo">Catalogo</a>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <section className="product-card">
          <div className="product-media">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="product-media-image" />
            ) : (
              <span className="product-media-fallback">{product.name[0]}</span>
            )}
          </div>

          <div className="product-info">
            <p className="product-category">Categoria: {product.category?.name ?? "General"}</p>
            <h1 className="product-title">{product.name}</h1>
            <p className="product-price">{formatCop(product.price)}</p>

            <div className="product-actions-row">
              <a href="/#catalogo" className="product-link-secondary">
                Volver al catalogo
              </a>
              <a href="/carrito" className="product-link-secondary">
                Ir al carrito
              </a>
            </div>

            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: Number(product.price),
                stock: product.stock,
              }}
            />
          </div>
        </section>

        <section className="product-specs">
          <div className="product-specs-head">
            <h2>Ficha tecnica</h2>
            <p>Revisa compatibilidad y datos clave antes de confirmar tu compra.</p>
          </div>

          {technicalEntries.length === 0 && <p className="product-specs-empty">Sin detalles tecnicos cargados.</p>}

          {technicalEntries.length > 0 && (
            <ul className="product-specs-grid">
              {technicalEntries.map(([key, value]) => (
                <li key={key} className="product-spec-item">
                  <strong>{key}</strong>
                  <span>{String(value)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="product-recommended">
          <div className="product-specs-head">
            <h2>Productos recomendados</h2>
            <p>Basados en categoria y compatibilidad de moto para ayudarte a completar tu compra.</p>
          </div>

          {recommendedProducts.length === 0 && (
            <p className="product-specs-empty">No encontramos recomendados relacionados por ahora.</p>
          )}

          {recommendedProducts.length > 0 && (
            <RecommendedCarousel items={recommendedProducts} />
          )}
        </section>
      </div>
    </main>
  );
}
