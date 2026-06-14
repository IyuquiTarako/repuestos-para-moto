"use client";

import { CSSProperties, FormEvent, useMemo, useState } from "react";

type ProductCreatePayload = {
  name: string;
  price: number;
  stock: number;
};

const cardStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  background: "#ffffff",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  marginTop: 6,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 12,
};

const buttonStyle: CSSProperties = {
  border: "none",
  background: "#0f172a",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};

export default function AdminPage() {
  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000",
    []
  );

  const [adminToken, setAdminToken] = useState(
    process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "mototech-admin-token"
  );

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");

  const [stockProductId, setStockProductId] = useState("");
  const [stockValue, setStockValue] = useState("0");

  const [message, setMessage] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoadingCreate(true);

    try {
      const payload: ProductCreatePayload = {
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
      };

      const response = await fetch(`${apiBaseUrl}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail ?? "No se pudo guardar el producto");
      }

      setMessage(`Producto guardado con ID ${data.id} y slug ${data.slug}`);
      setName("");
      setPrice("");
      setStock("0");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleUpdateStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoadingStock(true);

    try {
      const response = await fetch(`${apiBaseUrl}/products/${stockProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken,
        },
        body: JSON.stringify({ stock: Number(stockValue) }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail ?? "No se pudo actualizar el stock");
      }

      setMessage(`Stock actualizado. Producto ${data.id} ahora tiene ${data.stock} unidades.`);
      setStockProductId("");
      setStockValue("0");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setLoadingStock(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Panel de Administrador</h1>
      <p style={{ marginBottom: 20, color: "#334155" }}>
        Crea productos rapidamente y actualiza stock para mantener la tienda al dia.
      </p>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Autenticacion</h2>
        <label style={labelStyle}>
          Token admin (header X-Admin-Token)
          <input
            style={inputStyle}
            type="text"
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
            placeholder="mototech-admin-token"
          />
        </label>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Crear producto</h2>
        <form onSubmit={handleCreateProduct}>
          <label style={labelStyle}>
            Nombre del repuesto
            <input
              style={inputStyle}
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Pastillas Brembo"
            />
          </label>

          <label style={labelStyle}>
            Precio
            <input
              style={inputStyle}
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="189900"
            />
          </label>

          <label style={labelStyle}>
            Stock
            <input
              style={inputStyle}
              type="number"
              min="0"
              required
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              placeholder="12"
            />
          </label>

          <button style={buttonStyle} type="submit" disabled={loadingCreate}>
            {loadingCreate ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Actualizar stock por ID</h2>
        <form onSubmit={handleUpdateStock}>
          <label style={labelStyle}>
            ID del producto
            <input
              style={inputStyle}
              type="number"
              min="1"
              required
              value={stockProductId}
              onChange={(event) => setStockProductId(event.target.value)}
              placeholder="1"
            />
          </label>

          <label style={labelStyle}>
            Nuevo stock
            <input
              style={inputStyle}
              type="number"
              min="0"
              required
              value={stockValue}
              onChange={(event) => setStockValue(event.target.value)}
              placeholder="25"
            />
          </label>

          <button style={buttonStyle} type="submit" disabled={loadingStock}>
            {loadingStock ? "Actualizando..." : "Actualizar stock"}
          </button>
        </form>
      </section>

      {message && (
        <p style={{ padding: 12, borderRadius: 8, background: "#f1f5f9", color: "#0f172a" }}>
          {message}
        </p>
      )}
    </main>
  );
}
