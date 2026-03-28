"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import type { ReactNode } from "react";
import {
  LayoutDashboardIcon,
  ImportIcon,
  MapIcon,
  UsersIcon,
  CalendarIcon,
  ParkingIcon,
} from "@/components/ui/Icons";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const adminItems: NavItem[] = [
  { href: "/admin", icon: <LayoutDashboardIcon size={22} />, label: "Dashboard" },
];

const managerItems: NavItem[] = [
  { href: "/manager", icon: <LayoutDashboardIcon size={22} />, label: "Dashboard" },
  { href: "/manager/users", icon: <UsersIcon size={22} />, label: "Mieszkańcy" },
  { href: "/manager/reservations", icon: <CalendarIcon size={22} />, label: "Rezerwacje" },
  { href: "/manager/editor", icon: <MapIcon size={22} />, label: "Kreator" },
  { href: "/manager/import", icon: <ImportIcon size={22} />, label: "Import" },
];

const residentItems: NavItem[] = [
  { href: "/parking", icon: <ParkingIcon size={22} />, label: "Parking" },
  { href: "/parking/reservations", icon: <CalendarIcon size={22} />, label: "Rezerwacje" },
];

const roleItemMap: Record<string, NavItem[]> = {
  SUPER_ADMIN: adminItems,
  MANAGER: managerItems,
  RESIDENT: residentItems,
};

export function BottomNav({ session }: { session: Session }) {
  const pathname = usePathname();
  const role = (session.user as Record<string, unknown>).role as string;
  const items = roleItemMap[role] ?? residentItems;

  return (
    <nav className="bottom-nav" aria-label="Nawigacja mobilna">
      <div className="bottom-nav-inner">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname.startsWith(item.href + "/") &&
              !items.some(
                (other) =>
                  other.href !== item.href &&
                  (pathname === other.href || pathname.startsWith(other.href + "/"))
              ));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item${isActive ? " active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
