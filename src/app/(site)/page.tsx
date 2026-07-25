import Hero from "@/components/home/Hero";
import NewsCard from "@/components/home/NewsCard";
import FeaturedSlider from "@/components/home/FeaturedSlider";
import RegionFilter from "@/components/home/RegionFilter";
import ColumnistsSection from "@/components/home/ColumnistsSection";
import Sidebar from "@/components/home/Sidebar";
import VideosSection from "@/components/home/VideosSection";
import ClassifiedsSection from "@/components/home/ClassifiedsSection";
import { getNews, getMostRead, getFeaturedNews, getClassifieds, getVideos, mapApiNewsToNewsItem } from "@/lib/api";
import AdSlot from "@/components/ads/AdSlot";

function SectionHead({ title, seeAll }: { title: string; seeAll?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-5 border-b-[3px] border-support pb-2.5">
      <h2 className="text-[1.4rem] font-title font-semibold flex items-center gap-2.5">
        <span className="w-2 h-6 bg-primary rounded-sm inline-block" />
        {title}
      </h2>
      {seeAll && <a href="#" className="font-menu font-semibold text-[0.8rem] text-primary hover:underline whitespace-nowrap">{seeAll} →</a>}
    </div>
  );
}

export default async function Home() {
  // limit 12: os 4 primeiros (mais recentes por publishedAt) alimentam o Hero
  // ("Última Hora" + 3 mini-manchetes) e os demais preenchem o grid — sem repetir notícia.
  // Sem fallback mock: mostrar notícias falsas como se fossem reais seria enganoso.
  const apiNews = await getNews({ limit: 12 });
  const newsItems = apiNews.map(mapApiNewsToNewsItem);
  const heroItems = newsItems.slice(0, 4);
  const gridItems = newsItems.slice(4, 12);
  const mostRead = await getMostRead(7);

  // Só entram aqui notícias marcadas manualmente como "Destaque" (⭐) no /admin/noticias —
  // sem fallback mock: mostrar notícias falsas como "destaque" seria enganoso.
  const featuredNews = await getFeaturedNews(5);
  const featuredItems = featuredNews.map(mapApiNewsToNewsItem);

  const classifieds = await getClassifieds();
  const videos = await getVideos();

  return (
    <main>
      <Hero items={heroItems} />

      <section id="ultimas" className="max-w-[1280px] mx-auto px-4 py-10">
        <SectionHead title="Últimas Notícias" seeAll="Ver todas" />
        {gridItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gridItems.map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 py-6">Nenhuma notícia publicada ainda. Volte em breve.</p>
        )}
      </section>

      {featuredItems.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 py-10">
          <SectionHead title="Notícias em Destaque" />
          <FeaturedSlider items={featuredItems} />
        </section>
      )}

      <section className="max-w-[1280px] mx-auto px-4 py-10">
        <SectionHead title="Filtrar por Região" />
        <RegionFilter />
      </section>

      <section className="max-w-[1280px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-7 items-start">
          <div>
            <SectionHead title="Colunistas & Opinião" />
            <ColumnistsSection />
          </div>

          <Sidebar mostRead={mostRead} />
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-4 py-10">
        <SectionHead title="Últimos Vídeos" seeAll="TV Milgrau" />
        <VideosSection items={videos} />
      </section>

      <section id="classificados" className="max-w-[1280px] mx-auto px-4 py-10">
        <SectionHead title="Classificados" />
        <ClassifiedsSection items={classifieds} />
      </section>

      <section className="max-w-[1280px] mx-auto px-4 py-10">
        <AdSlot slot="footer-banner" size="970x90" />
      </section>
    </main>
  );
}
