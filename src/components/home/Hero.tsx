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
        <article className="relative rounded-xl overflow-hidden shadow-md">
          <Link href={`/noticia/${main.slug}`}>
            <ImgPlaceholder icon={main.icon} ratio="16/9" label={`${main.cat} — imagem de capa`} src={main.image} alt={main.title} priority />
          </Link>
          <div className="absolute inset-x-0 bottom-0 p-6 pb-5 bg-gradient-to-t from-black/85 via-black/25 to-transparent text-white">
            <Tag color="alert" className="mb-2.5">Última Hora</Tag>
            <h1 className="text-[clamp(1.1rem,2.2vw,1.6rem)] font-title font-bold mb-2">
              <Link href={`/noticia/${main.slug}`} className="hover:underline">
                {main.title}
              </Link>
            </h1>
            <p className="text-gray-200 text-[0.8rem] max-w-[60ch] mb-2.5 line-clamp-2">{main.resumo}</p>
            <div className="flex flex-wrap gap-3.5 items-center font-menu text-[0.72rem] text-gray-200">
              <span>✍️ Por {main.autor}</span>
              <span>🕒 {main.hora}</span>
              <span>📖 {main.tempo} de leitura</span>
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
