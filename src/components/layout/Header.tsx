import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import AuthStatus from "./AuthStatus";
import { categoryHref } from "@/lib/categories";

const NAV_LINKS = [
  ["/", "Início"],
  ["/#ultimas", "Últimas Notícias"],
  [categoryHref("Política"), "Política"],
  [categoryHref("Polícia"), "Polícia"],
  [categoryHref("Economia"), "Economia"],
  [categoryHref("Agronegócio"), "Agronegócio"],
  [categoryHref("Esportes"), "Esportes"],
  [categoryHref("Saúde"), "Saúde"],
  [categoryHref("Educação"), "Educação"],
  [categoryHref("Entretenimento"), "Entretenimento"],
  [categoryHref("Tecnologia"), "Tecnologia"],
  [categoryHref("Brasil"), "Brasil"],
  [categoryHref("Mundo"), "Mundo"],
  ["/#colunistas", "Colunistas"],
  ["/#videos", "Vídeos"],
  ["/#classificados", "Classificados"],
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between gap-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 leading-none">
          <Image src="/images/logo-icon.webp" alt="" width={44} height={44} className="shrink-0" priority />
          <span className="flex flex-col leading-none">
            <span className="font-title font-extrabold text-2xl tracking-tight text-support">
              PORTAL <span className="text-primary">TUCUMÃ</span> MILGRAU
            </span>
            <span className="font-menu text-[0.62rem] tracking-widest uppercase text-primary mt-0.5">A notícia em tempo real</span>
          </span>
        </Link>
        <div className="flex items-center gap-2.5">
          <AuthStatus />
          <button className="w-[38px] h-[38px] rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary/10">🔔</button>
          <MobileMenu />
        </div>
      </div>

      <nav className="hidden lg:block border-t border-gray-200">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center justify-between">
          <ul className="flex flex-wrap">
            {NAV_LINKS.map(([href, label]) => (
              <li key={label}>
                <Link
                  href={href}
                  className="block font-menu font-semibold text-[0.78rem] tracking-wide uppercase px-3 py-3 border-b-[3px] border-transparent hover:text-primary hover:border-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <SearchBar />
        </div>
      </nav>
    </header>
  );
}
