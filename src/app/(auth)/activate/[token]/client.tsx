"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckIcon, XIcon, ParkingIcon } from "@/components/ui/Icons";

type Status = "valid" | "invalid" | "expired" | "already_active";

export function ActivatePageClient({
  status,
  token,
  userName,
  userEmail,
}: {
  status: Status;
  token?: string;
  userName?: string;
  userEmail?: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków");
      return;
    }
    if (password !== confirm) {
      setError("Hasła nie są identyczne");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Wystąpił błąd");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "invalid") {
    return (
      <div style={{ width: "100%", maxWidth: "440px", padding: "1rem", textAlign: "center" }}>
        <div className="glass-strong" style={{ borderRadius: "var(--radius-lg)", padding: "3rem 2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger)" }}>
              <XIcon size={28} />
            </div>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Nieprawidłowy link</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Link aktywacyjny jest nieprawidłowy lub już został użyty.
          </p>
          <Link href="/login" className="btn btn-primary btn-block">
            Przejdź do logowania
          </Link>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div style={{ width: "100%", maxWidth: "440px", padding: "1rem", textAlign: "center" }}>
        <div className="glass-strong" style={{ borderRadius: "var(--radius-lg)", padding: "3rem 2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--warning)" }}>
              <XIcon size={28} />
            </div>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Link wygasł</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Link aktywacyjny wygasa po 48 godzinach. Skontaktuj się z zarządcą, aby wysłał nowy link.
          </p>
          <Link href="/login" className="btn btn-secondary btn-block">
            Wróć do logowania
          </Link>
        </div>
      </div>
    );
  }

  if (status === "already_active") {
    return (
      <div style={{ width: "100%", maxWidth: "440px", padding: "1rem", textAlign: "center" }}>
        <div className="glass-strong" style={{ borderRadius: "var(--radius-lg)", padding: "3rem 2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)" }}>
              <CheckIcon size={28} />
            </div>
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Konto już aktywne</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            Twoje konto jest już aktywowane. Możesz się zalogować.
          </p>
          <Link href="/login" className="btn btn-primary btn-block">
            Przejdź do logowania
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: "440px", padding: "1rem" }}>
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
            marginBottom: "1rem",
            boxShadow: "0 8px 24px rgba(37, 99, 235, 0.35)",
            color: "#fff",
          }}
        >
          <ParkingIcon size={32} />
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          Witaj, {userName}!
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Ustaw hasło aby aktywować konto
        </p>
        {userEmail && (
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>
            {userEmail}
          </p>
        )}
      </div>

      <div className="glass-strong" style={{ borderRadius: "var(--radius-lg)", padding: "2rem" }}>
        {success ? (
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)" }}>
                <CheckIcon size={28} />
              </div>
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Konto aktywowane!</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Przekierowujemy Cię do strony logowania...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label className="label" htmlFor="password">
                Nowe hasło
              </label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="Minimum 8 znaków"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label className="label" htmlFor="confirm">
                Potwierdź hasło
              </label>
              <input
                id="confirm"
                className="input"
                type="password"
                placeholder="Powtórz hasło"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? "Aktywowanie..." : "Aktywuj konto"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
