"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

type Estate = {
  id: string;
  name: string;
  address: string;
  createdAt: Date;
  _count: { users: number; parkingLayouts: number };
};

type Stats = {
  estateCount: number;
  userCount: number;
  spotCount: number;
  reservationCount: number;
};

export function AdminDashboardClient({
  stats,
  estates: initialEstates,
}: {
  stats: Stats;
  estates: Estate[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [estates, setEstates] = useState(initialEstates);
  const [formError, setFormError] = useState("");

  const createEstate = trpc.estate.create.useMutation({
    onSuccess: (newEstate) => {
      setEstates((prev) => [
        { ...newEstate, _count: { users: 0, parkingLayouts: 0 } },
        ...prev,
      ]);
      setName("");
      setAddress("");
      setShowForm(false);
      setFormError("");
    },
    onError: (err) => setFormError(err.message),
  });

  const statCards = [
    { label: "Osiedla", value: stats.estateCount, icon: "🏘️", color: "var(--accent-primary)" },
    { label: "Użytkownicy", value: stats.userCount, icon: "👥", color: "var(--info)" },
    { label: "Miejsca parkingowe", value: stats.spotCount, icon: "🅿️", color: "var(--success)" },
    { label: "Rezerwacje", value: stats.reservationCount, icon: "📅", color: "var(--warning)" },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title gradient-text">Panel Super Admina</h1>
          <p className="page-subtitle">Zarządzaj osiedlami i całym systemem</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <span>+</span>
          <span>Nowe osiedle</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((stat) => (
          <div key={stat.label} className="card-stat">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
              <span style={{ fontSize: "1.75rem", opacity: 0.6 }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add estate form */}
      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: "1.5rem", maxWidth: "500px" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "1.25rem" }}>Dodaj nowe osiedle</h3>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Nazwa osiedla</label>
            <input
              className="input"
              placeholder="np. Osiedle Słoneczne"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Adres</label>
            <input
              className="input"
              placeholder="np. ul. Słoneczna 15, 00-100 Warszawa"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          {formError && (
            <p style={{ color: "var(--danger)", fontSize: "0.8125rem", marginBottom: "1rem" }}>{formError}</p>
          )}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn btn-primary"
              disabled={createEstate.isPending || !name || !address}
              onClick={() => createEstate.mutate({ name, address })}
            >
              {createEstate.isPending ? "Dodawanie..." : "Dodaj osiedle"}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Estates list */}
      <div>
        <h2 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "1rem" }}>
          Wszystkie osiedla ({estates.length})
        </h2>
        {estates.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🏘️</div>
            <p>Brak osiedli. Dodaj pierwsze osiedle.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
            {estates.map((estate) => (
              <div key={estate.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{estate.name}</h3>
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{estate.address}</p>
                  </div>
                  <span style={{ fontSize: "1.5rem" }}>🏘️</span>
                </div>
                <hr className="divider" style={{ margin: "0.75rem 0" }} />
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{estate._count.users}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Użytkownicy</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{estate._count.parkingLayouts}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Layouty</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
