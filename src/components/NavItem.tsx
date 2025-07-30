import Link from "next/link";
import { ReactNode } from "react";

// описываем пропсы отдельно
interface Props {
  href?: string;          // если есть — рендерим <Link>, иначе <span>
  icon: string;           // CSS‑класс иконки, напр. "ri-gift-line"
  children: ReactNode;    // текст пункта
  badge?: string;         // опц. бейдж справа
  chevron?: boolean;      // добавить стрелку ▼ (если нужен аккордеон)
}

export default function NavItem({
  href,
  icon,
  children,
  badge,
  chevron,
}: Props) {
  const Wrapper: any = href ? Link : "span";
  const isActive =
    typeof window !== "undefined" && href
      ? window.location.pathname === href
      : false;

  return (
    <Wrapper
      href={href ?? "#"}
      className={`flex items-center justify-between px-4 py-4 rounded-lg transition
        ${isActive ? "bg-white/5 text-nav-active" : "text-nav hover:text-white hover:bg-white/5"}
      `}
    >
      <span className="flex items-center gap-3">
        <i className={`${icon} text-lg`} />
        <span className="text-base font-semibold leading-none">{children}</span>
      </span>

      {badge && (
        <span className="text-[10px] font-bold bg-green-500 text-gray-900 px-2 py-px rounded-md uppercase tracking-wide">
          {badge}
        </span>
      )}

      {chevron && (
        <i className="ri-arrow-down-s-line ml-2 text-nav-muted group-open:rotate-180 transition-transform" />
      )}
    </Wrapper>
  );
}
