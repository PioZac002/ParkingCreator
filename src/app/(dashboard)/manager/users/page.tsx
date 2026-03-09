import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusBadge: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Aktywny", color: "var(--success)" },
  PENDING: { label: "Oczekujący", color: "var(--warning)" },
  DISABLED: { label: "Wyłączony", color: "var(--danger)" },
};

export default async function ManagerUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ estateId?: string }>;
}) {
  const session = await auth();
  const role = (session?.user as Record<string, unknown>)?.role as string;
  if (!session?.user || (role !== "MANAGER" && role !== "SUPER_ADMIN")) redirect("/login");

  const { estateId: estateIdParam } = await searchParams;

  // Get manager's estates
  const userWithEstates = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { managedEstates: { select: { id: true, name: true }, orderBy: { name: "asc" } } },
  });
  const managedEstates = userWithEstates?.managedEstates ?? [];

  const activeEstateId =
    estateIdParam && managedEstates.find((e) => e.id === estateIdParam)
      ? estateIdParam
      : managedEstates[0]?.id ?? null;

  if (!activeEstateId) redirect("/manager");

  const activeEstate = managedEstates.find((e) => e.id === activeEstateId)!;

  const users = await prisma.user.findMany({
    where: { estateId: activeEstateId, role: "RESIDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      // All parking spots for this user
      parkingSpots: {
        select: { id: true, number: true, type: true },
        where: { layout: { estateId: activeEstateId } },
      },
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
          <p className="page-subtitle">
            {activeEstate.name}
            {managedEstates.length > 1 && (
              <> · </>
            )}
            {managedEstates.length > 1 && managedEstates.map((e, i) => (
              <span key={e.id}>
                {i > 0 && " | "}
                <Link
                  href={`/manager/users?estateId=${e.id}`}
                  style={{ color: e.id === activeEstateId ? "var(--accent-secondary)" : "var(--text-muted)", textDecoration: "none", fontWeight: e.id === activeEstateId ? 600 : 400 }}
                >
                  {e.name}
                </Link>
              </span>
            ))}
          </p>
        </div>
        <Link href={`/manager/import?estateId=${activeEstateId}`} className="btn btn-primary">
          <span>📥</span><span>Importuj</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <div className="card-stat"><div className="stat-value">{counts.total}</div><div className="stat-label">Łącznie</div></div>
        <div className="card-stat"><div className="stat-value" style={{ color: "var(--success)" }}>{counts.active}</div><div className="stat-label">Aktywni</div></div>
        <div className="card-stat"><div className="stat-value" style={{ color: "var(--warning)" }}>{counts.pending}</div><div className="stat-label">Oczekujący</div></div>
      </div>

      {users.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👥</div>
          <p>Brak mieszkańców. Skorzystaj z importu.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr>
                {["Imię i nazwisko", "Email", "Miejsca parkingowe", "Status", "Dołączył"].map((h) => (
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
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.875rem 1.25rem", fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: "0.875rem 1.25rem", color: "var(--text-secondary)" }}>{u.email}</td>
                    <td style={{ padding: "0.875rem 1.25rem" }}>
                      {u.parkingSpots.length === 0 ? (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      ) : (
                        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                          {u.parkingSpots.map((s) => (
                            <span key={s.id} style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-secondary)", background: "rgba(108,92,231,0.12)", padding: "0.125rem 0.5rem", borderRadius: "9999px" }}>
                              {s.number}
                            </span>
                          ))}
                        </div>
                      )}
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
