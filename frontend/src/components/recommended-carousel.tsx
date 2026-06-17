"use client";

import { useEffect, useMemo, useState } from "react";

type RecommendedItem = {
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

type RecommendedCarouselProps = {
  items: RecommendedItem[];
};

function formatCop(value: number | string): string {
  const asNumber = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(asNumber)) return "COP 0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(asNumber);
}

function getVisibleCount(width: number): number {
  if (width < 640) return 1;
  if (width < 980) return 2;
  if (width < 1240) return 3;
  return 4;
}

export default function RecommendedCarousel({ items }: RecommendedCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const syncVisibleCount = () => {
      const nextVisibleCount = getVisibleCount(window.innerWidth);
      setVisibleCount(nextVisibleCount);
      setStartIndex((prev) => Math.max(0, Math.min(prev, Math.max(0, items.length - nextVisibleCount))));
    };

    syncVisibleCount();
    window.addEventListener("resize", syncVisibleCount);
    return () => window.removeEventListener("resize", syncVisibleCount);
  }, [items.length]);

  const maxStart = useMemo(() => Math.max(0, items.length - visibleCount), [items.length, visibleCount]);
  return (
    <div className="recommended-carousel" aria-label="Carrusel de productos recomendados">
      <button
        type="button"
        className="recommended-arrow"
        aria-label="Ver productos anteriores"
        onClick={() => setStartIndex((prev) => Math.max(0, prev - 1))}
        disabled={startIndex === 0}
      >
        ‹
      </button>

      <div className="recommended-viewport">
        <div
          className="recommended-track"
          style={{
            ["--visible-count" as string]: visibleCount,
            ["--start-index" as string]: startIndex,
          }}
        >
          {items.map((item) => (
          <a key={item.id} href={`/productos/${item.slug}`} className="recommended-card" aria-label={`Ver ${item.name}`}>
            <div className="recommended-media">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="recommended-image" />
              ) : (
                <span className="recommended-fallback">{item.name[0]}</span>
              )}
            </div>

            <div className="recommended-body">
              <p className="recommended-category">{item.category?.name ?? "General"}</p>
              <h3 className="recommended-title">{item.name}</h3>
              <p className="recommended-price">{formatCop(item.price)}</p>
            </div>
          </a>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="recommended-arrow"
        aria-label="Ver mas productos"
        onClick={() => setStartIndex((prev) => Math.min(maxStart, prev + 1))}
        disabled={startIndex >= maxStart}
      >
        ›
      </button>
    </div>
  );
}
