"use client";

import type { Session } from "next-auth";
import { DashboardSidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { ParkingIcon } from "@/components/ui/Icons";

export function DashboardShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar – desktop only (hidden on mobile via CSS) */}
      <DashboardSidebar session={session} />

      <div className="dashboard-content">
        {/* Mobile top bar – logo only */}
        <header className="mobile-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
              }}
            >
              <ParkingIcon size={15} />
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>PMS</span>
          </div>
        </header>

        <main style={{ flex: 1 }}>{children}</main>
      </div>

      {/* Bottom nav – mobile only (hidden ≥768px via CSS) */}
      <BottomNav session={session} />
    </div>
  );
}
