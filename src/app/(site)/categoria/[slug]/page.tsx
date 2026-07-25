import Link from "next/link";
import { notFound } from "next/navigation";
import NewsCard from "@/components/home/NewsCard";
import Sidebar from "@/components/home/Sidebar";
import Tag from "@/components/ui/Tag";
import { getCategories, getNews, getMostRead, mapApiNewsToNewsItem } from "@/lib/api";

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [categories, apiNews, mostRead] = await Promise.all([
    getCategories(),
    getNews({ category: slug, limit: 24 }),
    getMostRead(7),
  ]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const newsItems = apiNews.map(mapApiNewsToNewsItem);
  const tagColor = category.color === "alert" ? "alert" : category.color === "highlight" ? "highlight" : "primary";

  return (
    <main className="max-w-[1280px] mx-auto px-4 py-8">
      <p className="font-menu text-[0.75rem] text-gray-600 mb-4">
        <Link href="/" className="hover:text-primary">Início</Link> / {category.name}
      </p>

      <div className="flex items-center gap-3 mb-6">
        <Tag color={tagColor}>{category.name}</Tag>
        <h1 className="text-[clamp(1.6rem,3vw,2.2rem)] font-title font-bold">{category.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
        <div>
          {newsItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {newsItems.map((item) => (
                <NewsCard key={item.slug} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
              Ainda não há notícias publicadas em {category.name}. Volte em breve.
            </div>
          )}
        </div>

        <Sidebar mostRead={mostRead} />
      </div>
    </main>
  );
}
