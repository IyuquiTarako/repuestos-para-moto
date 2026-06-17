"use client";

import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProductCreatePayload = {
  name: string;
  price: number;
  stock: number;
};

const cardStyle = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
  background: "linear-gradient(180deg, rgba(20,29,37,0.8), rgba(15,23,42,0.8))",
  color: "#fff",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  marginTop: 6,
  fontSize: 14,
};

const labelStyle = {
  display: "block" as const,
  fontSize: 14,
  fontWeight: 600 as const,
  marginBottom: 12,
  color: "#cbd5e1",
};

const buttonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #ff7722, #ff5500)",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 8,
  fontWeight: 700 as const,
  cursor: "pointer" as const,
  marginRight: 8,
  transition: "all 0.2s ease",
};

function AdminContent() {
  const router = useRouter();
  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000",
    []
  );

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");

  const [stockProductId, setStockProductId] = useState("");
  const [stockValue, setStockValue] = useState("0");

  const [saleProductId, setSaleProductId] = useState("");
  const [saleQuantity, setSaleQuantity] = useState("1");

  const [message, setMessage] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingSale, setLoadingSale] = useState(false);

  const adminToken = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("auth_token") || "";
  }, []);

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
          "X-Admin-Token": "mototech-admin-token",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail ?? "No se pudo guardar el producto");
      }

      setMessage(`✓ Producto guardado: "${data.name}" (ID: ${data.id})`);
      setName("");
      setPrice("");
      setStock("0");
    } catch (error) {
      setMessage("✗ " + (error instanceof Error ? error.message : "Error inesperado"));
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
          "X-Admin-Token": "mototech-admin-token",
        },
        body: JSON.stringify({ stock: Number(stockValue) }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail ?? "No se pudo actualizar el stock");
      }

      setMessage(`✓ Stock actualizado a ${data.stock} unidades`);
      setStockProductId("");
      setStockValue("0");
    } catch (error) {
      setMessage("✗ " + (error instanceof Error ? error.message : "Error inesperado"));
    } finally {
      setLoadingStock(false);
    }
  }

  async function handleConfirmSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoadingSale(true);

    try {
      const response = await fetch(`${apiBaseUrl}/products/${saleProductId}/sale?quantity=${saleQuantity}`, {
        method: "POST",
        headers: {
          "X-Admin-Token": "mototech-admin-token",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.detail ?? "No se pudo confirmar la venta");
      }

      setMessage(`✓ Venta confirmada. Total vendido: ${data.sales_count} unidades`);
      setSaleProductId("");
      setSaleQuantity("1");
    } catch (error) {
      setMessage("✗ " + (error instanceof Error ? error.message : "Error inesperado"));
    } finally {
      setLoadingSale(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/");
  };

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "Poppins, Segoe UI, sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0e17 0%, #12182a 100%)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4, color: "#fff" }}>Panel de Administrador</h1>
          <p style={{ color: "#94a3b8", margin: 0 }}>Gestiona productos, stock y analiza ventas</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            ...buttonStyle,
            background: "transparent",
            border: "1px solid #ff7722",
            color: "#ff7722",
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Crear Producto */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>Crear nuevo producto</h2>
        <form onSubmit={handleCreateProduct}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <label style={labelStyle}>
              Nombre del repuesto
              <input
                style={inputStyle}
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Pastillas Brembo..."
              />
            </label>

            <label style={labelStyle}>
              Precio (COP)
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
              Stock inicial
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
          </div>

          <button style={buttonStyle} type="submit" disabled={loadingCreate}>
            {loadingCreate ? "Guardando..." : "Crear producto"}
          </button>
        </form>
      </section>

      {/* Actualizar Stock */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>Actualizar stock</h2>
        <form onSubmit={handleUpdateStock}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
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
          </div>

          <button style={buttonStyle} type="submit" disabled={loadingStock}>
            {loadingStock ? "Actualizando..." : "Actualizar stock"}
          </button>
        </form>
      </section>

      {/* Confirmar Venta */}
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: 20, fontSize: 20 }}>Confirmar venta</h2>
        <p style={{ color: "#94a3b8", marginBottom: 20, fontSize: 13 }}>
          Registra ventas completadas para rastrear popularidad y tendencias
        </p>
        <form onSubmit={handleConfirmSale}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <label style={labelStyle}>
              ID del producto vendido
              <input
                style={inputStyle}
                type="number"
                min="1"
                required
                value={saleProductId}
                onChange={(event) => setSaleProductId(event.target.value)}
                placeholder="1"
              />
            </label>

            <label style={labelStyle}>
              Cantidad vendida
              <input
                style={inputStyle}
                type="number"
                min="1"
                required
                value={saleQuantity}
                onChange={(event) => setSaleQuantity(event.target.value)}
                placeholder="1"
              />
            </label>
          </div>

          <button style={buttonStyle} type="submit" disabled={loadingSale}>
            {loadingSale ? "Confirmando..." : "Confirmar venta"}
          </button>
        </form>
      </section>

      {/* Mensaje */}
      {message && (
        <div
          style={{
            padding: 14,
            borderRadius: 8,
            background: message.startsWith("✓")
              ? "rgba(34, 197, 94, 0.1)"
              : "rgba(239, 68, 68, 0.1)",
            border:
              "1px solid " + (message.startsWith("✓") ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"),
            color: message.startsWith("✓") ? "#86efac" : "#fca5a5",
            fontSize: 14,
            marginTop: 20,
          }}
        >
          {message}
        </div>
      )}
    </main>
  );
}

export default function AdminPage() {
  return (
    <ProtectedAdminRoute>
      <AdminContent />
    </ProtectedAdminRoute>
  );
}
