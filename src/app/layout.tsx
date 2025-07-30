import Link from "next/link";
import "./globals.css";
import Header from '@/components/Header';
import NavItem from "@/components/NavItem";
import SubItem from "@/components/SubItem";


import { Poppins } from "next/font/google";
const poppins = Poppins({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600'],
  variable: '--font-poppins',
});



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={poppins.variable}>
      <body className="flex flex-col min-h-screen bg-gray-700 text-white">
        {/* ——— Шапка вынесена ——— */}
        <Header />

        {/* ——— Основной контейнер со старым сайдбаром ——— */}
        <div className="flex flex-1">
          <aside className="w-84 bg-navbar flex flex-col text-sm">
            <nav className="px-4 py-6 space-y-1">
              <NavItem href="/dashboard" icon="ri-user-line">Личный кабинет</NavItem>
              <NavItem href="/video-maker" icon="ri-video-line">Фабрика видео</NavItem>
              <NavItem href="/my-presets" icon="ri-slideshow-line">Мои пресеты</NavItem>
              <NavItem href="/my-channels" icon="ri-play-line">Мои каналы</NavItem>
              <NavItem href="/gallery" icon="ri-image-line">Галерея</NavItem>
              <NavItem href="/plans" icon="ri-price-tag-3-line">Планы</NavItem>
            </nav>
          </aside>

          <main className="flex-1 p-6 bg-cegment bg-opacity-80">{children}</main>
        </div>
      </body>
    </html>
  );
}