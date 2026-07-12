import type { SVGProps } from "react";

type IconProps = {
  name: string;
  className?: string;
};

function BaseIcon({
  children,
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-6 w-6 shrink-0 ${className}`}
      {...props}
    >
      {children}
    </svg>
  );
}

export function MaterialIcon({ name, className = "h-6 w-6" }: IconProps) {
  switch (name) {
    case "menu":
      return (
        <BaseIcon className={className}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </BaseIcon>
      );
    case "mail":
      return (
        <BaseIcon className={className}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </BaseIcon>
      );
    case "lock":
      return (
        <BaseIcon className={className}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
          <path d="M12 15v2" />
        </BaseIcon>
      );
    case "visibility":
      return (
        <BaseIcon className={className}>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
          <circle cx="12" cy="12" r="3" />
        </BaseIcon>
      );
    case "visibility_off":
      return (
        <BaseIcon className={className}>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
          <path d="M9.9 5.1A11.4 11.4 0 0 1 12 5c6.5 0 10 7 10 7a18.6 18.6 0 0 1-4 4.9" />
          <path d="M6.7 6.7A18.2 18.2 0 0 0 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" />
        </BaseIcon>
      );
    case "database":
      return (
        <BaseIcon className={className}>
          <ellipse cx="12" cy="5" rx="7" ry="3" />
          <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
          <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
        </BaseIcon>
      );
    case "airport_shuttle":
    case "directions_car":
    case "local_taxi":
      return (
        <BaseIcon className={className}>
          <path d="M5 16l1.5-6A3 3 0 0 1 9.4 8h5.2a3 3 0 0 1 2.9 2l1.5 6" />
          <path d="M4 16h16v3a1 1 0 0 1-1 1h-1v-2H6v2H5a1 1 0 0 1-1-1v-3Z" />
          <circle cx="8" cy="16" r="1.5" />
          <circle cx="16" cy="16" r="1.5" />
          <path d="M7.5 8 9 5h6l1.5 3" />
        </BaseIcon>
      );
    case "dashboard":
      return (
        <BaseIcon className={className}>
          <rect x="3" y="3" width="8" height="8" rx="1" />
          <rect x="13" y="3" width="8" height="5" rx="1" />
          <rect x="13" y="10" width="8" height="11" rx="1" />
          <rect x="3" y="13" width="8" height="8" rx="1" />
        </BaseIcon>
      );
    case "person":
    case "person_pin":
      return (
        <BaseIcon className={className}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20c1.8-3 4.2-4.5 7-4.5s5.2 1.5 7 4.5" />
        </BaseIcon>
      );
    case "groups":
      return (
        <BaseIcon className={className}>
          <circle cx="9" cy="9" r="3" />
          <circle cx="17" cy="11" r="2.5" />
          <path d="M3.5 19c1.4-2.5 3.3-3.8 5.5-3.8 2.2 0 4.1 1.3 5.5 3.8" />
          <path d="M14.5 18c1-1.7 2.4-2.7 4.1-2.7 1 0 1.9.3 2.9.9" />
        </BaseIcon>
      );
    case "account_balance_wallet":
    case "payments":
      return (
        <BaseIcon className={className}>
          <path d="M4 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
          <path d="M4 9V7a2 2 0 0 1 2-2h10" />
          <circle cx="16" cy="13" r="1.3" />
        </BaseIcon>
      );
    case "fact_check":
      return (
        <BaseIcon className={className}>
          <path d="M9 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9" />
          <path d="M9 8h8" />
          <path d="M9 12h8" />
          <path d="M9 16h5" />
          <path d="m3 9 1.5 1.5L7 8" />
          <path d="m3 15 1.5 1.5L7 14" />
        </BaseIcon>
      );
    case "settings":
      return (
        <BaseIcon className={className}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z" />
        </BaseIcon>
      );
    case "logout":
      return (
        <BaseIcon className={className}>
          <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H4" />
        </BaseIcon>
      );
    case "search":
      return (
        <BaseIcon className={className}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </BaseIcon>
      );
    case "notifications":
    case "notifications_active":
      return (
        <BaseIcon className={className}>
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </BaseIcon>
      );
    case "chat":
    case "chat_bubble":
      return (
        <BaseIcon className={className}>
          <path d="M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        </BaseIcon>
      );
    case "shield_person":
      return (
        <BaseIcon className={className}>
          <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />
          <circle cx="12" cy="10" r="2.5" />
          <path d="M8.5 16c.8-1.6 2-2.4 3.5-2.4s2.7.8 3.5 2.4" />
        </BaseIcon>
      );
    case "check":
      return (
        <BaseIcon className={className}>
          <path d="m5 12 4 4L19 6" />
        </BaseIcon>
      );
    case "close":
      return (
        <BaseIcon className={className}>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </BaseIcon>
      );
    case "expand_more":
      return (
        <BaseIcon className={className}>
          <path d="m6 9 6 6 6-6" />
        </BaseIcon>
      );
    default:
      return (
        <BaseIcon className={className}>
          <circle cx="12" cy="12" r="8" />
        </BaseIcon>
      );
  }
}
