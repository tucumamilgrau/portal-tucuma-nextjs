import Link from "next/link";

export const metadata = {
  title: "Sobre Nós — Portal Tucumã Milgrau",
  description: "A história do Portal Tucumã Milgrau: do Facebook em 2016 ao Instagram @tucumamilgrau, com mais de 20 milhões de visualizações mensais.",
};

export default function SobrePage() {
  return (
    <main className="max-w-[1280px] mx-auto px-4 py-8">
      <p className="font-menu text-[0.75rem] text-gray-600 mb-4">
        <Link href="/" className="hover:text-primary">Início</Link> / Sobre Nós
      </p>

      <div className="max-w-[820px]">
        <h1 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-title font-bold mb-3.5">Sobre o Portal Tucumã Milgrau</h1>
        <p className="text-[1.05rem] text-gray-600 mb-8">
          A notícia em tempo real do sul do Pará — do Facebook em 2016 a uma das maiores audiências digitais da região.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-[820px]">
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="font-title text-[1.8rem] font-bold text-primary">2016</div>
          <div className="font-menu text-[0.72rem] text-gray-500 uppercase mt-1">Ano de fundação</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <div className="font-title text-[1.8rem] font-bold text-primary">20M+</div>
          <div className="font-menu text-[0.72rem] text-gray-500 uppercase mt-1">Visualizações mensais</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <a
            href="https://www.instagram.com/tucumamilgrau"
            target="_blank"
            rel="noopener noreferrer"
            className="font-title text-[1.8rem] font-bold text-primary hover:underline"
          >
            @tucumamilgrau
          </a>
          <div className="font-menu text-[0.72rem] text-gray-500 uppercase mt-1">Instagram</div>
        </div>
      </div>

      <div className="max-w-[720px] text-[1.02rem] text-gray-800 space-y-4.5">
        <h2 className="text-[1.3rem] font-title font-semibold mt-2 mb-1">Nossa história</h2>
        <p>
          O Portal Tucumã Milgrau nasceu em 2016 como uma página no Facebook, criada para levar as notícias do
          dia a dia de Tucumã e região a quem não tinha acesso à cobertura da grande imprensa local. O que começou
          como um espaço simples de avisos e coberturas rápidas foi ganhando a confiança do público a cada
          publicação.
        </p>
        <p>
          Com o crescimento da audiência, o projeto se consolidou no Instagram, onde hoje é conhecido pelo perfil{" "}
          <a href="https://www.instagram.com/tucumamilgrau" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
            @tucumamilgrau
          </a>
          . A página se tornou referência para milhares de seguidores que acompanham diariamente os assuntos do sul
          do Pará, somando hoje mais de <strong>20 milhões de visualizações mensais</strong> entre as redes sociais
          e o portal.
        </p>
        <h2 className="text-[1.3rem] font-title font-semibold mt-2 mb-1">O que cobrimos</h2>
        <p>
          Mantemos o foco no que sempre nos trouxe até aqui: <strong>notícias regionais</strong> de Tucumã,
          Ourilândia do Norte, São Félix do Xingu, Xinguara e toda a região sul do Pará — política, polícia,
          agronegócio, economia, esportes, saúde e educação. Ao lado disso, também acompanhamos os principais
          fatos do <strong>noticiário nacional</strong>, para que o leitor encontre em um só lugar o que acontece
          na sua cidade e no Brasil.
        </p>
        <p>
          Seguimos comprometidos com o jornalismo independente e em tempo real que nos trouxe até aqui — do
          Facebook de 2016 ao portal de hoje.
        </p>
      </div>
    </main>
  );
}
