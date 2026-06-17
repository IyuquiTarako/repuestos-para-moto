"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isRegistering ? "/auth/register" : "/auth/login";
      const body = isRegistering
        ? { email, password, username }
        : { email, password };

      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || "Error en la autenticación");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      // Guardar token y datos del usuario en localStorage
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      // Redirigir al admin si es admin, o al home si es usuario normal
      if (data.user.is_admin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Error de conexión. Verifica que el backend esté corriendo.");
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">
            {isRegistering ? "Crear cuenta" : "Iniciar sesión"}
          </h1>
          <p className="login-subtitle">
            {isRegistering
              ? "Crea una cuenta para acceder al panel"
              : "Accede con tu email y contraseña"}
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Nombre de usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tu_usuario"
                  className="form-input"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="form-submit" disabled={isLoading}>
              {isLoading
                ? "Cargando..."
                : isRegistering
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
            </button>
          </form>

          <div className="login-toggle">
            <p className="login-toggle-text">
              {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                }}
                className="login-toggle-btn"
              >
                {isRegistering ? "Inicia sesión" : "Regístrate"}
              </button>
            </p>
          </div>

          <div className="login-footer">
            <a href="/" className="login-back-link">
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 20px;
          background: linear-gradient(135deg, #0a0e17 0%, #12182a 100%);
        }

        .login-container {
          width: 100%;
          max-width: 400px;
        }

        .login-card {
          background: linear-gradient(180deg, rgba(20, 29, 37, 0.95), rgba(15, 23, 42, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
        }

        .login-title {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 800;
          color: #f8fafc;
          text-align: center;
        }

        .login-subtitle {
          margin: 0 0 28px;
          color: #94a3b8;
          font-size: 14px;
          text-align: center;
        }

        .login-form {
          display: grid;
          gap: 18px;
          margin-bottom: 28px;
        }

        .form-group {
          display: grid;
          gap: 8px;
        }

        .form-label {
          color: #cbd5e1;
          font-weight: 600;
          font-size: 13px;
        }

        .form-input {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #ff7722;
          background: rgba(255, 119, 34, 0.1);
          box-shadow: 0 0 12px rgba(255, 119, 34, 0.2);
        }

        .form-input::placeholder {
          color: #64748b;
        }

        .form-error {
          padding: 10px 12px;
          background: rgba(127, 29, 29, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #fca5a5;
          font-size: 13px;
          margin: 0;
        }

        .form-submit {
          background: linear-gradient(135deg, #ff7722, #ff5500);
          color: #fff;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 15px rgba(255, 85, 0, 0.3);
        }

        .form-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #ff8833, #ff6611);
          box-shadow: 0 0 25px rgba(255, 85, 0, 0.5);
          transform: translateY(-2px);
        }

        .form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-toggle {
          text-align: center;
          margin-bottom: 18px;
        }

        .login-toggle-text {
          margin: 0;
          color: #94a3b8;
          font-size: 14px;
          display: flex;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .login-toggle-btn {
          background: none;
          border: none;
          color: #ff7722;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }

        .login-toggle-btn:hover {
          color: #ff9944;
        }

        .login-footer {
          text-align: center;
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .login-back-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .login-back-link:hover {
          color: #fff;
        }
      `}</style>
    </main>
  );
}
