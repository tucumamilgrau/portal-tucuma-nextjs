import Link from "next/link";
import { notFound } from "next/navigation";
import ImgPlaceholder from "@/components/ui/ImgPlaceholder";
import Tag from "@/components/ui/Tag";
import ArticleToc from "@/components/article/ArticleToc";
import ReadingProgress from "@/components/article/ReadingProgress";
import CommentSection from "@/components/article/CommentSection";
import ShareWhatsAppButton from "@/components/article/ShareWhatsAppButton";
import Sidebar from "@/components/home/Sidebar";
import NewsCard from "@/components/home/NewsCard";
import AdSlot from "@/components/ads/AdSlot";
import InstagramEmbed from "@/components/article/InstagramEmbed";
import { getNewsBySlug, getMostRead, mapApiNewsToNewsItem, formatTime, formatViews, resolveMediaUrl, getYouTubeEmbedUrl, isInstagramUrl } from "@/lib/api";
import { categoryImage, ARTICLE_PA279_IMAGE } from "@/lib/images";

// Slug do artigo "flagship" com tratamento editorial completo (galeria, mapa,
// citação em destaque, índice) — para os demais, o corpo vem 1:1 da API.
const FLAGSHIP_SLUG = "duplicacao-pa-279";

export default async function NoticiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, mostRead] = await Promise.all([getNewsBySlug(slug), getMostRead(7)]);

  if (!article) notFound();

  const related = article.related.map(mapApiNewsToNewsItem);
  const publishedDate = new Date(article.publishedAt).toLocaleDateString("pt-BR");
  const tagColor = article.category.color === "alert" ? "alert" : article.category.color === "highlight" ? "highlight" : "primary";

  return (
    <main className="max-w-[1280px] mx-auto px-4">
      <ReadingProgress />

      <p className="font-menu text-[0.75rem] text-gray-600 my-4">
        <Link href="/" className="hover:text-primary">Início</Link> / <Link href={`/categoria/${article.category.slug}`} className="hover:text-primary">{article.category.name}</Link> / {article.title}
      </p>

      <div className="max-w-[820px]">
        <Tag color={tagColor}>{article.category.name}</Tag>
        <h1 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-title font-bold my-3.5">{article.title}</h1>
        {article.subtitle && <p className="text-[1.05rem] text-gray-600 mb-[18px]">{article.subtitle}</p>}
        <div className="flex flex-wrap items-center gap-3 py-3.5 border-y border-gray-200 mb-5">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-support text-white flex items-center justify-center font-title font-bold">
            {article.author.initials}
          </div>
          <div>
            <b className="text-[0.85rem] block">{article.author.name}</b>
            <span className="text-[0.72rem] text-gray-400">{article.author.specialty} · Tucumã-PA</span>
          </div>
          <div className="flex gap-3 font-menu text-[0.72rem] text-gray-600">
            <span>🕒 {publishedDate} · {formatTime(article.publishedAt)}</span>
            <span>📖 {article.readTimeMin} min de leitura</span>
            <span>👁️ {formatViews(article.views)}</span>
          </div>
          <div className="flex gap-2 ml-auto flex-wrap items-center">
            <ShareWhatsAppButton title={article.title} />
            {["📘", "📸", "✈️", "✖️", "🧵", "💼"].map((i) => (
              <a key={i} href="#" className="w-[34px] h-[34px] rounded-full bg-gray-100 flex items-center justify-center hover:bg-primary hover:text-white">{i}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto mb-6 rounded-xl overflow-hidden shadow-md">
        <ImgPlaceholder
          icon={article.coverIcon}
          ratio="16/8"
          label="Imagem de capa — ver IMAGENS-PROMPTS.md do protótipo estático"
          src={resolveMediaUrl(article.coverImage) ?? (slug === FLAGSHIP_SLUG ? ARTICLE_PA279_IMAGE : categoryImage(article.category.name))}
          alt={article.title}
          priority
        />
      </div>

      <div className={`grid grid-cols-1 ${slug === FLAGSHIP_SLUG ? "xl:grid-cols-[200px_1fr_300px]" : "xl:grid-cols-[1fr_300px]"} gap-8 items-start`}>
        {slug === FLAGSHIP_SLUG && <ArticleToc />}

        <article className="text-[1.02rem] text-gray-800 max-w-[720px] [&_p]:mb-4.5 [&_h2]:text-[1.3rem] [&_h2]:font-title [&_h2]:font-semibold [&_h2]:mt-7 [&_h2]:mb-3.5">
          {slug === FLAGSHIP_SLUG ? (
            <FlagshipBody />
          ) : (
            article.body.split("\n\n").map((paragraph, i) => <p key={i}>{paragraph}</p>)
          )}

          {article.videoUrl && (() => {
            const embedUrl = getYouTubeEmbedUrl(article.videoUrl);
            if (embedUrl) {
              return (
                <div className="not-prose my-6 aspect-video rounded-xl overflow-hidden shadow-md">
                  <iframe
                    src={embedUrl}
                    title="Vídeo da notícia"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              );
            }
            if (isInstagramUrl(article.videoUrl)) {
              return <InstagramEmbed url={article.videoUrl} />;
            }
            return (
              <a
                href={article.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="not-prose inline-flex items-center gap-2 my-6 px-4 py-2.5 rounded-full bg-primary text-white font-menu font-semibold text-[0.85rem] hover:opacity-90"
              >
                ▶ Assistir ao vídeo
              </a>
            );
          })()}

          {article.sourceUrl && (
            <p className="not-prose flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-3 font-menu text-[0.8rem] text-gray-600">
              🔗 Conteúdo original de{" "}
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="font-semibold text-primary hover:underline"
              >
                {article.sourceName ?? "fonte externa"}
              </a>
              , reproduzido com atribuição pela redação do Portal Tucumã Milgrau.
            </p>
          )}

          {related.length > 0 && (
            <div className="mt-7">
              <div className="flex items-center justify-between gap-3 mb-5 border-b-[3px] border-support pb-2.5">
                <h2 className="text-[1.4rem]! font-title font-semibold flex items-center gap-2.5 mt-0!">
                  <span className="w-2 h-6 bg-primary rounded-sm inline-block" />
                  Notícias Relacionadas
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((item) => (
                  <NewsCard key={item.slug} item={item} />
                ))}
              </div>
            </div>
          )}

          <CommentSection slug={article.slug} initialComments={article.comments} />
        </article>

        <aside>
          <div className="bg-white rounded-xl shadow-sm p-[18px] mb-5">
            <AdSlot slot="article-sidebar" size="300x600" />
          </div>
          <Sidebar mostRead={mostRead} />
        </aside>
      </div>
    </main>
  );
}

/** Corpo com tratamento editorial completo do artigo em destaque (galeria, mapa, citação, índice). */
function FlagshipBody() {
  return (
    <>
      <h2 id="s1">O anúncio</h2>
      <p>
        A Prefeitura de Tucumã confirmou nesta quarta-feira (23) o pacote de investimentos destinado à
        duplicação de um trecho de 18 quilômetros da rodovia PA-279, uma das principais vias de escoamento da
        produção agropecuária do sul do Pará.
      </p>
      <p>
        Segundo o secretário municipal de Infraestrutura, os recursos somam R$ 42 milhões, sendo parte
        proveniente de convênio com o Governo do Estado e parte de contrapartida municipal.
      </p>

      <blockquote className="border-l-4 border-primary pl-[18px] py-1.5 my-5 italic text-gray-600">
        &quot;Essa é a obra mais importante para a mobilidade regional em uma década. Vai encurtar distâncias e
        salvar vidas&quot;, afirmou o prefeito durante coletiva de imprensa.
      </blockquote>

      <h2 id="s2">Cronograma das obras</h2>
      <p>
        O edital de licitação será publicado até o fim de julho, com previsão de início dos trabalhos em
        agosto de 2026. A conclusão está estimada para o segundo semestre de 2027, em três etapas.
      </p>

      <figure className="my-[22px]">
        <ImgPlaceholder icon="🛣️" label="Galeria de fotos — obras/rodovia" />
        <figcaption className="text-[0.75rem] text-gray-400 mt-1.5">
          Trecho da PA-279 que receberá a duplicação, próximo ao km 12.
        </figcaption>
      </figure>

      <div className="grid grid-cols-3 gap-2 my-5">
        <ImgPlaceholder icon="📷" ratio="1/1" />
        <ImgPlaceholder icon="📷" ratio="1/1" />
        <ImgPlaceholder icon="📷" ratio="1/1" />
      </div>

      <h2 id="s3">Impacto econômico</h2>
      <p>
        Especialistas estimam que a obra pode reduzir em até 40% o tempo de deslocamento entre Tucumã e
        Ourilândia do Norte, favorecendo o escoamento agrícola e o transporte de passageiros na região.
      </p>

      <ImgPlaceholder icon="🗺️" ratio="16/7" label="Mapa interativo do trecho (placeholder)" />

      <h2 id="s4">Reação da população</h2>
      <p>
        Moradores e associações comerciais locais receberam a notícia com otimismo, apontando que a rodovia é
        hoje um dos principais gargalos logísticos da região.
      </p>

      <h2 id="s5">Próximos passos</h2>
      <p>
        A Prefeitura informou que reuniões públicas serão realizadas nos próximos meses para apresentar o
        projeto executivo à população.
      </p>

      <ul className="space-y-2 mb-5">
        <li className="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-100 rounded-md text-[0.82rem]">📄 <a href="#" className="hover:text-primary">Edital de licitação (PDF)</a></li>
        <li className="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-100 rounded-md text-[0.82rem]">📄 <a href="#" className="hover:text-primary">Projeto executivo — resumo técnico (PDF)</a></li>
      </ul>

      <div className="flex flex-wrap gap-2 mb-6">
        {["PA-279", "Infraestrutura", "Prefeitura de Tucumã", "Agronegócio", "Mobilidade"].map((t) => (
          <span key={t} className="font-menu text-[0.72rem] font-semibold px-3.5 py-1.5 rounded-full border-[1.5px] border-gray-200">{t}</span>
        ))}
      </div>
    </>
  );
}
