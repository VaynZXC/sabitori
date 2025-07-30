import Link from "next/link";
import { ReactNode } from "react";

export default function SubItem({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-2 py-1 rounded text-white/70
                 hover:bg-white/5 hover:text-white transition"
    >
      {children}
    </Link>
  );
}
