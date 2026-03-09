"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Layout = {
  id: string;
  name: string;
  zone: string | null;
  _count: { spots: number };
};

type Estate = {
  id: string;
  name: string;
  address: string;
  _count: { residents: number; parkingLayouts: number };
  parkingLayouts: Layout[];
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
};

const statusBadge: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Aktywny", color: "var(--success)" },
  PENDING: { label: "Oczekujący", color: "var(--warning)" },
  DISABLED: { label: "Wyłączony", color: "var(--danger)" },
};

export function ManagerDashboardClient({
  managedEstates,
  activeEstate,
  recentUsers,
  managerName,
}: {
  managedEstates: Estate[];
  activeEstate: Estate | null;
  recentUsers: User[];
  managerName: string;
}) {
  const router = useRouter();

  if (managedEstates.length === 0) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Brak przypisanych osiedli</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Skontaktuj się z Super Adminem, aby przypisać Cię do osiedla.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title gradient-text">Panel Zarządcy</h1>
        <p className="page-subtitle">Witaj, {managerName}</p>
      </div>

      {/* Estate selector (when managing multiple) */}
      {managedEstates.length > 1 && (
        <div style={{ marginBottom: "2rem" }}>
          <p className="label" style={{ marginBottom: "0.75rem" }}>Wybierz osiedle</p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {managedEstates.map((estate) => (
              <button
                key={estate.id}
                onClick={() => router.push(`/manager?estateId=${estate.id}`)}
                className={`btn ${activeEstate?.id === estate.id ? "btn-primary" : "btn-secondary"}`}
              >
                <span>🏘️</span>
                <span>{estate.name}</span>
                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>({estate._count.residents})</span>
              </button>
            ))}
          </div>
          {!activeEstate && (
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
              Wybierz osiedle aby zobaczyć szczegóły.
            </p>
          )}
        </div>
      )}

      {activeEstate && (
        <>
          {/* Active estate header */}
          {managedEstates.length > 1 && (
            <div className="card animate-fade-in" style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem", borderColor: "var(--accent-primary)", borderWidth: "1.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>{activeEstate.name}</h2>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{activeEstate.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <Link
              href={`/manager/import?estateId=${activeEstate.id}`}
              className="card"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📥</div>
              <div style={{ fontWeight: 600 }}>Import mieszkańców</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>CSV, XLSX, TXT, JSON</div>
            </Link>
            <Link
              href={`/manager/editor?estateId=${activeEstate.id}`}
              className="card"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🗺️</div>
              <div style={{ fontWeight: 600 }}>Kreator parkingu</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Edytuj layout</div>
            </Link>
            <Link
              href={`/manager/users?estateId=${activeEstate.id}`}
              className="card"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
              <div style={{ fontWeight: 600 }}>Mieszkańcy</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {activeEstate._count.residents} użytkowników
              </div>
            </Link>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: "2rem" }}>
            <div className="card-stat">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div className="stat-value" style={{ color: "var(--accent-secondary)" }}>{activeEstate._count.residents}</div>
                  <div className="stat-label">Mieszkańcy</div>
                </div>
                <span style={{ fontSize: "1.75rem", opacity: 0.6 }}>👥</span>
              </div>
            </div>
            <div className="card-stat">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div className="stat-value" style={{ color: "var(--info)" }}>{activeEstate._count.parkingLayouts}</div>
                  <div className="stat-label">Layouty parkingu</div>
                </div>
                <span style={{ fontSize: "1.75rem", opacity: 0.6 }}>🗺️</span>
              </div>
            </div>
            <div className="card-stat">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div className="stat-value" style={{ color: "var(--success)" }}>
                    {activeEstate.parkingLayouts.reduce((s, l) => s + l._count.spots, 0)}
                  </div>
                  <div className="stat-label">Miejsca parkingowe</div>
                </div>
                <span style={{ fontSize: "1.75rem", opacity: 0.6 }}>🅿️</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Recent users */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>Ostatni mieszkańcy</h2>
                <Link href={`/manager/users?estateId=${activeEstate.id}`} className="btn btn-ghost btn-sm">
                  Wszyscy →
                </Link>
              </div>
              {recentUsers.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  <p>Brak mieszkańców. Skorzystaj z importu.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {recentUsers.map((user) => {
                    const badge = statusBadge[user.status] ?? statusBadge.PENDING;
                    return (
                      <div key={user.id} className="card" style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{user.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user.email}</div>
                          </div>
                          <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: badge.color, background: `${badge.color}20`, padding: "0.2rem 0.5rem", borderRadius: "9999px" }}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Parking layouts */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>Layouty parkingu</h2>
                <Link href={`/manager/editor?estateId=${activeEstate.id}`} className="btn btn-ghost btn-sm">
                  Nowy →
                </Link>
              </div>
              {activeEstate.parkingLayouts.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  <p>Brak layoutów. Utwórz pierwszy.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {activeEstate.parkingLayouts.map((layout) => (
                    <Link
                      key={layout.id}
                      href={`/manager/editor?estateId=${activeEstate.id}&layoutId=${layout.id}`}
                      className="card"
                      style={{ padding: "0.75rem 1rem", textDecoration: "none" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{layout.name}</div>
                          {layout.zone && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Strefa {layout.zone}</div>}
                        </div>
                        <span style={{ fontWeight: 700, color: "var(--accent-secondary)" }}>
                          {layout._count.spots} miejsc
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
