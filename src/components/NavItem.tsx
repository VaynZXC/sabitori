import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  href?: string;
  iconSrc: string;
  iconColor?: string;  // Теперь опциональный
  chevron?: boolean;
  children: React.ReactNode;
  badge?: string;
}

export default function NavItem({
  href,
  iconSrc,
  iconColor,
  children,
  badge,
  chevron,
}: Props) {
  const isActive =
    typeof window !== "undefined" && href
      ? window.location.pathname === href
      : false;

  const content = (
    <div
      className={`group flex flex-col px-3 py-3 rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-white/5
        ${isActive ? "bg-profile text-nav-active shadow-sm" : "text-nav hover:text-white"}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-${iconColor} p-1`}>
            <img src={iconSrc} alt="" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-lg font-semibold leading-none">{children}</span>
        </span>

        {badge && (
          <span className="text-[10px] font-bold bg-green-500 text-gray-900 px-2 py-px rounded-md uppercase tracking-wide">
            {badge}
        </span>
        )}

        {chevron && (
          <i className="ri-arrow-down-s-line ml-2 text-nav-muted group-hover:rotate-180 transition-transform" />
        )}
      </div>

      {chevron && (
        <div className="hidden group-hover:flex flex-col mt-2 space-y-1 pl-6 transition-all duration-300">
          <Link href="/tutorials" className="text-base hover:text-blue-400">Туториалы</Link>
          <Link href="/referrals" className="text-base hover:text-blue-400">Рефералы</Link>
          <Link href="/billing" className="text-base hover:text-blue-400">Биллинг</Link>
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href}>{content}</Link>
  ) : (
    content
  );
}