import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import { FOOTER_BG_IMAGE } from "@/lib/images";
import { categoryHref } from "@/lib/categories";

export default function Footer() {
  return (
    <footer className="relative bg-support text-gray-200 mt-10 overflow-hidden">
      <Image src={FOOTER_BG_IMAGE} alt="" fill className="object-cover opacity-25" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-b from-support/70 via-support to-support" />

      <div className="relative border-b border-[#2a2a2a] py-12">
        <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-8">
          <div>
            <span className="font-title font-extrabold text-xl text-white">TUCUMÃ <span className="text-primary">MILGRAU</span></span>
            <p className="text-[0.8rem] text-gray-400 mt-2.5">Jornalismo independente e em tempo real para Tucumã e toda a região sul do Pará.</p>
            <div className="flex gap-2.5 mt-3.5">
              {["📸", "📘", "▶️", "✖️", "🟢"].map((i) => (
                <a key={i} href="#" className="w-[34px] h-[34px] rounded-full bg-[#1f1f1f] flex items-center justify-center hover:bg-primary">{i}</a>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-white font-menu text-[0.85rem] uppercase mb-3.5 tracking-wide">Editorias</h5>
            <ul className="space-y-2 text-[0.82rem]">
              <li><Link href={categoryHref("Política")} className="hover:text-primary">Política</Link></li>
              <li><Link href={categoryHref("Polícia")} className="hover:text-primary">Polícia</Link></li>
              <li><Link href={categoryHref("Economia")} className="hover:text-primary">Economia</Link></li>
              <li><Link href={categoryHref("Agronegócio")} className="hover:text-primary">Agronegócio</Link></li>
              <li><Link href={categoryHref("Esportes")} className="hover:text-primary">Esportes</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-menu text-[0.85rem] uppercase mb-3.5 tracking-wide">Institucional</h5>
            <ul className="space-y-2 text-[0.82rem]">
              <li><Link href="/sobre" className="hover:text-primary">Sobre Nós</Link></li>
              <li>
                <a
                  href="https://wa.me/5562982282495?text=Ol%C3%A1%20%2C%20gostaria%20de%20fazer%20uma%20den%C3%BAncia%20ou%20tirar%20alguma%20d%C3%BAvida%20com%20o%20portal%20Tucum%C3%A3%20milgrau.%20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Contato
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5562982282495?text=Ol%C3%A1%20%2C%20gostaria%20de%20fazer%20uma%20den%C3%BAncia%20ou%20tirar%20alguma%20d%C3%BAvida%20com%20o%20portal%20Tucum%C3%A3%20milgrau.%20"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Anuncie
                </a>
              </li>
              <li>
                <a
                  href="mailto:tucumamilgrau@gmail.com?subject=Curr%C3%ADculo%20-%20Trabalhe%20Conosco"
                  className="hover:text-primary"
                >
                  Trabalhe Conosco
                </a>
              </li>
              <li><a href="#" className="hover:text-primary">Termos de Uso</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-menu text-[0.85rem] uppercase mb-3.5 tracking-wide">Serviços</h5>
            <ul className="space-y-2 text-[0.82rem]">
              <li><Link href="/login" className="hover:text-primary">Área do Leitor</Link></li>
              <li><a href="#" className="hover:text-primary">Assinatura Premium</a></li>
              <li><Link href="/#classificados" className="hover:text-primary">Classificados</Link></li>
              <li><Link href="/admin" className="hover:text-primary">Painel Admin</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-menu text-[0.85rem] uppercase mb-3.5 tracking-wide">Newsletter</h5>
            <p className="text-[0.8rem] text-gray-400">Receba as principais notícias direto no seu e-mail.</p>
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="relative max-w-[1280px] mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-2.5 text-[0.75rem] text-gray-400">
        <span>© 2026 Portal Tucumã Milgrau. Todos os direitos reservados.</span>
        <span className="[&>a]:ml-3.5">
          <a href="#" className="hover:text-primary">Privacidade</a>
          <a href="#" className="hover:text-primary">Termos</a>
          <a href="#" className="hover:text-primary">Denúncias</a>
        </span>
      </div>
    </footer>
  );
}
