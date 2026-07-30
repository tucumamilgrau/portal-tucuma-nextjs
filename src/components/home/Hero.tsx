import Link from "next/link";
import ImgPlaceholder from "@/components/ui/ImgPlaceholder";
import Tag from "@/components/ui/Tag";
import ShareWhatsAppButton from "@/components/article/ShareWhatsAppButton";
import type { NewsItem } from "@/data/news";

// items[0] é a manchete principal ("Última Hora" — a notícia publicada mais recentemente,
// inclusive as que vieram do ingestor automático de RSS uma vez aprovadas no /admin);
// items[1..3] alimentam a coluna de mini-manchetes ao lado.
export default function Hero({ items }: { items: NewsItem[] }) {
  const [main, ...rest] = items;
  const mini = rest.slice(0, 3);

  if (!main) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <article className="relative rounded-xl overflow-hidden shadow-md bg-white">
          <Link href={`/noticia/${main.slug}`}>
            <ImgPlaceholder icon={main.icon} ratio="16/9" label={`${main.cat} — imagem de capa`} src={main.image} alt={main.title} priority />
          </Link>
          {/* Mobile: texto abaixo da imagem, compacto, sem sobrepor — títulos longos
              cortavam a imagem quando o texto ficava por cima dela em telas pequenas.
              A partir de sm: volta ao estilo com overlay em cima da imagem. */}
          <div className="p-3.5 sm:absolute sm:inset-x-0 sm:bottom-0 sm:p-6 sm:pb-5 sm:bg-gradient-to-t sm:from-black/85 sm:via-black/25 sm:to-transparent text-gray-900 sm:text-white">
            <Tag color="alert" className="mb-1.5 sm:mb-2.5">Última Hora</Tag>
            <h1 className="text-[0.98rem] sm:text-[clamp(1.1rem,2.2vw,1.6rem)] font-title font-bold mb-1.5 sm:mb-2 line-clamp-3 sm:line-clamp-none">
              <Link href={`/noticia/${main.slug}`} className="hover:underline">
                {main.title}
              </Link>
            </h1>
            <p className="hidden sm:block text-gray-200 text-[0.8rem] max-w-[60ch] mb-2.5 line-clamp-2">{main.resumo}</p>
            <div className="flex flex-wrap gap-2.5 sm:gap-3.5 items-center font-menu text-[0.66rem] sm:text-[0.72rem] text-gray-500 sm:text-gray-200">
              <span>✍️ Por {main.autor}</span>
              <span>🕒 {main.hora}</span>
              <span className="hidden sm:inline">📖 {main.tempo} de leitura</span>
              <ShareWhatsAppButton title={main.title} path={`/noticia/${main.slug}`} variant="pill" className="ml-auto" />
            </div>
          </div>
        </article>

        <div className="flex flex-col lg:flex-col md:flex-row gap-3.5">
          {mini.map((m) => (
            <Link key={m.slug} href={`/noticia/${m.slug}`} className="flex items-start gap-3 bg-white rounded-xl overflow-hidden shadow-sm flex-1 hover:shadow-md transition-shadow">
              <ImgPlaceholder icon={m.icon} ratio="1/1" className="w-[110px] shrink-0" src={m.image} alt={m.title} />
              <div className="py-2.5 pr-3 flex flex-col justify-center gap-1.5">
                <Tag color={(m.color as "alert" | "highlight") ?? "primary"} className="self-start">{m.cat}</Tag>
                <h4 className="text-[0.85rem] font-semibold leading-snug">{m.title}</h4>
                <span className="font-menu text-[0.65rem] text-gray-600">🕒 {m.hora}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
