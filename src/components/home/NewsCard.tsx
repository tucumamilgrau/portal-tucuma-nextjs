import Link from "next/link";
import ImgPlaceholder from "@/components/ui/ImgPlaceholder";
import Tag from "@/components/ui/Tag";
import type { NewsItem } from "@/data/news";

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col">
      <Link href={`/noticia/${item.slug}`}>
        <ImgPlaceholder icon={item.icon} label={`${item.cat} — placeholder (ver IMAGENS-PROMPTS.md)`} src={item.image} alt={item.title} />
      </Link>
      <div className="p-4 pt-3.5 flex flex-col gap-2 flex-1">
        <Tag color={(item.color as "alert" | "highlight") ?? "primary"} className="self-start">{item.cat}</Tag>
        <h3 className="text-[1rem] font-semibold leading-snug">
          <Link href={`/noticia/${item.slug}`} className="hover:text-primary">{item.title}</Link>
        </h3>
        <p className="text-[0.82rem] text-gray-600 flex-1">{item.resumo}</p>
        <div className="flex justify-between items-center font-menu text-[0.68rem] text-gray-400 border-t border-gray-100 pt-2 mt-1">
          <span>🕒 {item.tempo} de leitura</span>
          <span>👁️ {item.views}</span>
        </div>
      </div>
    </article>
  );
}
