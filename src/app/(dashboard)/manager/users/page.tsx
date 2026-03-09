import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusBadge: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Aktywny", color: "var(--success)" },
  PENDING: { label: "Oczekujący", color: "var(--warning)" },
  DISABLED: { label: "Wyłączony", color: "var(--danger)" },
};

export default async function ManagerUsersPage() {
  const session = await auth();
  const user = session?.user as Record<string, unknown> | undefined;

  if (!user || (user.role !== "MANAGER" && user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const estateId = user.estateId as string | null;
  if (!estateId) redirect("/manager");

  const users = await prisma.user.findMany({
    where: { estateId, role: "RESIDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      parkingSpots: { select: { number: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    total: users.length,
    active: users.filter((u) => u.status === "ACTIVE").length,
    pending: users.filter((u) => u.status === "PENDING").length,
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title gradient-text">Mieszkańcy</h1>
          <p className="page-subtitle">Lista wszystkich mieszkańców osiedla</p>
        </div>
        <a href="/manager/import" className="btn btn-primary">
          <span>📥</span>
          <span>Importuj</span>
        </a>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <div className="card-stat">
          <div className="stat-value">{counts.total}</div>
          <div className="stat-label">Łącznie</div>
        </div>
        <div className="card-stat">
          <div className="stat-value" style={{ color: "var(--success)" }}>{counts.active}</div>
          <div className="stat-label">Aktywni</div>
        </div>
        <div className="card-stat">
          <div className="stat-value" style={{ color: "var(--warning)" }}>{counts.pending}</div>
          <div className="stat-label">Oczekujący</div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👥</div>
          <p>Brak mieszkańców. Skorzystaj z importu aby dodać użytkowników.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr>
                {["Imię i nazwisko", "Email", "Miejsce", "Status", "Dołączył"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.875rem 1.25rem", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const badge = statusBadge[u.status] ?? statusBadge.PENDING;
                return (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-light)", transition: "background 0.15s" }}>
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--text-secondary)" }}>{u.email}</td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--accent-secondary)", fontWeight: 600 }}>
                      {u.parkingSpots[0]?.number ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: badge.color, background: `${badge.color}20`, padding: "0.2rem 0.6rem", borderRadius: "9999px" }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                      {new Date(u.createdAt).toLocaleDateString("pl-PL")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
