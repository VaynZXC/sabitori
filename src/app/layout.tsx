import "./globals.css";
import Header from '@/components/Header';
import NavItem from "@/components/NavItem";

import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '700'],
  variable: '--font-inter',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.className}>
      <body className="flex flex-col min-h-screen bg-gray-700 text-white">
        <Header />
        <div className="flex flex-1">
          <aside className="w-72 bg-navbar flex flex-col text-sm shadow-lg">
            <nav className="px-3 py-4 space-y-2 flex-grow">  {/* flex-grow для нав, чтобы баннер был внизу */}
              <NavItem href="/home" iconSrc="/icons/home.png">Главная</NavItem>
              <NavItem href="/dashboard" iconSrc="/icons/dashboard.png">Личный кабинет</NavItem>
              <NavItem href="/video-maker" iconSrc="/icons/factory.png">Фабрика видео</NavItem>
              <NavItem href="/my-presets" iconSrc="/icons/presets.png">Мои пресеты</NavItem>
              <NavItem href="/my-channels" iconSrc="/icons/channels.png">Мои каналы</NavItem>
              <NavItem href="/gallery" iconSrc="/icons/gallery.png">Галерея</NavItem>
              <NavItem href="/support" iconSrc="/icons/support.png">Поддержка</NavItem>
              <NavItem href="/plans" iconSrc="/icons/plans.png">Планы</NavItem>
              <NavItem iconSrc="/icons/more.png" iconColor="gray-500" chevron={true}>Прочее</NavItem>  {/* Новая вкладка */}
            </nav>
            {/* Баннер внизу */}
            <div className="p-3 border-t border-gray-600">
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gradient-to-r from-[#2a2c3e] to-[#1e2030] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                <span className="flex items-center gap-2">
                  <img src="/icons/open_app.png" alt="Открывать приложение" className="h-6 w-6" />  {/* Иконка сундука */}
                  <span className="text-lg font-semibold">Открыть приложение</span>
                </span>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">4</span>  {/* Бейдж */}
              </button>
            </div>
          </aside>
          <main className="flex-1 p-6 bg-cegment bg-opacity-80">{children}</main>
        </div>
      </body>
    </html>
  );
}