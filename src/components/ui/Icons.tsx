import type { CSSProperties } from "react";

type IconProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
};

const defaults = { size: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function LayoutDashboardIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function UsersIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function ImportIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function MapIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

export function CalendarIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function BuildingIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

export function ParkingIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  );
}

export function LogOutIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function PlusIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function TrashIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function ChevronDownIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function XIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function CheckIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function AlertIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function CrownIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M2 18h20" />
      <path d="M2 18l3-9 5 5 2-8 2 8 5-5 3 9" />
    </svg>
  );
}

export function ManagerIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
    </svg>
  );
}

export function HomeIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function EstateIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M3 21h18" />
      <path d="M9 8h1" /><path d="M9 12h1" /><path d="M9 16h1" />
      <path d="M14 8h1" /><path d="M14 12h1" /><path d="M14 16h1" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    </svg>
  );
}

export function UserPlusIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}
