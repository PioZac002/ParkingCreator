"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const demoAccounts = [
  {
    label: "Super Admin",
    email: "admin@pms.dev",
    role: "SUPER_ADMIN",
    icon: "👑",
    badge: "badge-admin",
    redirect: "/admin",
  },
  {
    label: "Zarządca",
    email: "zarzadca1@pms.dev",
    role: "MANAGER",
    icon: "🏢",
    badge: "badge-manager",
    redirect: "/manager",
  },
  {
    label: "Mieszkaniec",
    email: "mieszkaniec1@pms.dev",
    role: "RESIDENT",
    icon: "🏠",
    badge: "badge-resident",
    redirect: "/parking",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Nieprawidłowy email lub hasło");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account: (typeof demoAccounts)[0]) => {
    setError("");
    setDemoLoading(account.email);

    try {
      const result = await signIn("credentials", {
        email: account.email,
        password: "password123",
        redirect: false,
      });

      if (result?.error) {
        setError("Nie udało się zalogować na konto demo");
      } else {
        router.push(account.redirect);
        router.refresh();
      }
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: "440px", padding: "1rem" }}>
      {/* Logo / Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "var(--accent-gradient)",
            fontSize: "1.75rem",
            marginBottom: "1rem",
            boxShadow: "0 8px 24px rgba(108, 92, 231, 0.3)",
          }}
        >
          🅿️
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          Parking Management System
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Zaloguj się do systemu zarządzania parkingiem
        </p>
      </div>

      {/* Login Form */}
      <div className="glass-strong" style={{ borderRadius: "var(--radius-lg)", padding: "2rem" }}>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="twoj@email.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label" htmlFor="password">
              Hasło
            </label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-sm)",
                background: "rgba(225, 112, 85, 0.1)",
                border: "1px solid rgba(225, 112, 85, 0.3)",
                color: "var(--danger)",
                fontSize: "0.8125rem",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            margin: "1.5rem 0",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Demo
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
        </div>

        {/* Demo Login Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              className="btn btn-secondary btn-block"
              onClick={() => handleDemoLogin(account)}
              disabled={demoLoading !== null}
              style={{
                justifyContent: "flex-start",
                opacity: demoLoading === account.email ? 0.7 : 1,
              }}
            >
              <span style={{ fontSize: "1.125rem" }}>{account.icon}</span>
              <span style={{ flex: 1, textAlign: "left" }}>
                {demoLoading === account.email ? "Logowanie..." : `Zaloguj jako ${account.label}`}
              </span>
              <span className={`badge ${account.badge}`}>{account.role.replace("_", " ")}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p
        style={{
          textAlign: "center",
          marginTop: "1.5rem",
          color: "var(--text-muted)",
          fontSize: "0.75rem",
        }}
      >
        Parking Management System • Portfolio Project
      </p>
    </div>
  );
}
