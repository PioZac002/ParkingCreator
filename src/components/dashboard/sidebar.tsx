"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const adminNav: NavItem[] = [
  { href: "/admin", icon: "📊", label: "Dashboard" },
];

const managerNav: NavItem[] = [
  { href: "/manager", icon: "📊", label: "Dashboard" },
  { href: "/manager/import", icon: "📥", label: "Import mieszkańców" },
  { href: "/manager/editor", icon: "🗺️", label: "Kreator parkingu" },
  { href: "/manager/users", icon: "👥", label: "Mieszkańcy" },
  { href: "/manager/reservations", icon: "📅", label: "Rezerwacje" },
];

const residentNav: NavItem[] = [
  { href: "/parking", icon: "🅿️", label: "Moje parking" },
  { href: "/parking/reservations", icon: "📅", label: "Rezerwacje" },
];

const roleNavMap: Record<string, NavItem[]> = {
  SUPER_ADMIN: adminNav,
  MANAGER: managerNav,
  RESIDENT: residentNav,
};

const roleLabelMap: Record<string, { label: string; badge: string; icon: string }> = {
  SUPER_ADMIN: { label: "Super Admin", badge: "badge-admin", icon: "👑" },
  MANAGER: { label: "Zarządca", badge: "badge-manager", icon: "🏢" },
  RESIDENT: { label: "Mieszkaniec", badge: "badge-resident", icon: "🏠" },
};

export function DashboardSidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  const role = (session.user as Record<string, unknown>).role as string;
  const navItems = roleNavMap[role] ?? residentNav;
  const roleInfo = roleLabelMap[role] ?? roleLabelMap.RESIDENT;

  return (
    <aside className="sidebar animate-slide-in" style={{ position: "sticky", top: 0, height: "100vh" }}>
      {/* Logo */}
      <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: "1px solid var(--border-color)", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.25rem",
              flexShrink: 0,
            }}
          >
            🅿️
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1.2 }}>PMS</div>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", lineHeight: 1 }}>
              Parking Manager
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 0.5rem" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${isActive ? " active" : ""}`}
              style={{ borderRadius: "var(--radius-sm)", marginBottom: "2px" }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div
        style={{
          padding: "1rem 1.5rem",
          borderTop: "1px solid var(--border-color)",
          marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              flexShrink: 0,
            }}
          >
            {roleInfo.icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session.user.name}
            </div>
            <span className={`badge ${roleInfo.badge}`} style={{ fontSize: "0.625rem", padding: "0.125rem 0.5rem" }}>
              {roleInfo.label}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn btn-ghost btn-block btn-sm"
          style={{ justifyContent: "flex-start", color: "var(--danger)", fontSize: "0.8125rem" }}
        >
          <span>🚪</span>
          <span>Wyloguj się</span>
        </button>
      </div>
    </aside>
  );
}
