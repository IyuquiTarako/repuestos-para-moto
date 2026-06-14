import { notFound } from "next/navigation";

import AddToCartButton from "../../../components/add-to-cart-button";

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

  return (
    <main style={{ background: "#0a0a0c", minHeight: "100vh", color: "#f8fafc", padding: "28px 16px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <a href="/" style={{ color: "#fb923c", textDecoration: "none", fontWeight: 700 }}>
          ← Volver al catalogo
        </a>

        <section
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            background: "#141418",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              minHeight: 280,
              display: "grid",
              placeItems: "center",
              background:
                "radial-gradient(circle at 20% 20%, rgba(255,85,0,0.25), transparent 40%), linear-gradient(135deg, #222, #111)",
            }}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 90, color: "#f97316", fontWeight: 800 }}>{product.name[0]}</span>
            )}
          </div>

          <div style={{ padding: 24 }}>
            <p style={{ color: "#94a3b8", marginTop: 0, marginBottom: 10 }}>
              Categoria: {product.category?.name ?? "General"}
            </p>
            <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: 34 }}>{product.name}</h1>
            <p style={{ marginTop: 0, color: "#f97316", fontWeight: 800, fontSize: 24 }}>
              {formatCop(product.price)}
            </p>
            <p style={{ color: "#cbd5e1" }}>
              Stock actual: <strong>{product.stock}</strong>
            </p>

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

        <section
          style={{
            marginTop: 24,
            background: "#101014",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: 20,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Ficha tecnica</h2>
          {technicalEntries.length === 0 && <p style={{ color: "#94a3b8" }}>Sin detalles tecnicos cargados.</p>}
          {technicalEntries.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              {technicalEntries.map(([key, value]) => (
                <li
                  key={key}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "#1b1b22",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <strong style={{ color: "#f8fafc" }}>{key}</strong>
                  <span style={{ color: "#cbd5e1", textAlign: "right" }}>{String(value)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
