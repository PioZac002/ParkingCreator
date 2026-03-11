"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";
import {
  LayoutDashboardIcon,
  ImportIcon,
  MapIcon,
  UsersIcon,
  CalendarIcon,
  ParkingIcon,
  LogOutIcon,
  CrownIcon,
  ManagerIcon,
  HomeIcon,
} from "@/components/ui/Icons";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const adminNav: NavItem[] = [
  { href: "/admin", icon: <LayoutDashboardIcon size={18} />, label: "Dashboard" },
];

const managerNav: NavItem[] = [
  { href: "/manager", icon: <LayoutDashboardIcon size={18} />, label: "Dashboard" },
  { href: "/manager/import", icon: <ImportIcon size={18} />, label: "Import mieszkańców" },
  { href: "/manager/editor", icon: <MapIcon size={18} />, label: "Kreator parkingu" },
  { href: "/manager/users", icon: <UsersIcon size={18} />, label: "Mieszkańcy" },
  { href: "/manager/reservations", icon: <CalendarIcon size={18} />, label: "Rezerwacje" },
];

const residentNav: NavItem[] = [
  { href: "/parking", icon: <ParkingIcon size={18} />, label: "Moje parking" },
  { href: "/parking/reservations", icon: <CalendarIcon size={18} />, label: "Rezerwacje" },
];

const roleNavMap: Record<string, NavItem[]> = {
  SUPER_ADMIN: adminNav,
  MANAGER: managerNav,
  RESIDENT: residentNav,
};

const roleLabelMap: Record<string, { label: string; badge: string; icon: ReactNode }> = {
  SUPER_ADMIN: { label: "Super Admin", badge: "badge-admin", icon: <CrownIcon size={16} /> },
  MANAGER: { label: "Zarządca", badge: "badge-manager", icon: <ManagerIcon size={16} /> },
  RESIDENT: { label: "Mieszkaniec", badge: "badge-resident", icon: <HomeIcon size={16} /> },
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

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
              flexShrink: 0,
              color: "#fff",
            }}
          >
            <ParkingIcon size={22} />
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
              style={{
                borderRadius: "var(--radius-sm)",
                marginBottom: "2px",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{item.icon}</span>
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
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
              letterSpacing: "0.03em",
            }}
          >
            {getInitials(session.user.name)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session.user.name}
            </div>
            <span className={`badge ${roleInfo.badge}`} style={{ fontSize: "0.625rem", padding: "0.125rem 0.5rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              {roleInfo.icon}
              {roleInfo.label}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn btn-ghost btn-block btn-sm"
          style={{ justifyContent: "flex-start", color: "var(--danger)", fontSize: "0.8125rem", gap: "0.5rem" }}
        >
          <LogOutIcon size={15} />
          <span>Wyloguj się</span>
        </button>
      </div>
    </aside>
  );
}
