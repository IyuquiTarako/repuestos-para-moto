import CartIndicator from "./cart-indicator";

type SiteHeaderProps = {
  showAdmin?: boolean;
};

export default function SiteHeader({ showAdmin = false }: SiteHeaderProps) {
  return (
    <header className="header">
      <a href="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
        AP GROUP <span>MOTOTECH</span>
      </a>
      <nav className="nav">
        <a href="/#catalogo" className="nav-link">
          Catálogo
        </a>
        <CartIndicator />
        {showAdmin && (
          <a href="/login" className="btn-nav">
            Iniciar sesión
          </a>
        )}
      </nav>
    </header>
  );
}
