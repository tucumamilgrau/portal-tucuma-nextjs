import Link from "next/link";
import { EVENTS } from "@/data/news";
import { formatViews, type ApiNews } from "@/lib/api";
import AdSlot from "@/components/ads/AdSlot";
import WeatherWidget from "./WeatherWidget";

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-[18px] mb-5">
      <h3 className="text-[1rem] mb-3.5 flex items-center gap-2 border-b-2 border-gray-100 pb-2.5 font-title font-semibold">
        <span className="w-1.5 h-[18px] bg-primary rounded-sm inline-block" />
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function Sidebar({ mostRead }: { mostRead?: ApiNews[] }) {
  const items = mostRead?.map((n) => ({ slug: n.slug, title: n.title, views: formatViews(n.views) })) ?? [];

  return (
    <aside>
      <Widget title="🔥 Mais Lidas">
        {items.length > 0 ? (
          <ol>
            {items.map((item, i) => (
              <li key={item.title} className="flex gap-3.5 py-2.5 border-b border-gray-100 last:border-0 items-start">
                <span className="rank-num w-7 shrink-0">{i + 1}</span>
                <div>
                  <h4 className="text-[0.85rem] font-semibold leading-snug hover:text-primary">
                    <Link href={`/noticia/${item.slug}`}>{item.title}</Link>
                  </h4>
                  <div className="font-menu text-[0.65rem] text-gray-400 mt-1">👁️ {item.views} visualizações</div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-500 text-[0.85rem]">Nenhuma leitura registrada ainda.</p>
        )}
      </Widget>

      <WeatherWidget />

      <Widget title="📅 Agenda de Eventos">
        {EVENTS.map((e, i) => (
          <div key={e.titulo} className={`flex gap-3.5 py-3 ${i < EVENTS.length - 1 ? "border-b border-gray-100" : ""}`}>
            <div className="bg-support text-white rounded-md w-[52px] h-[52px] shrink-0 flex flex-col items-center justify-center font-title">
              <span className="text-[1.1rem] font-bold leading-none">{e.day}</span>
              <span className="text-[0.6rem] uppercase text-primary">{e.mon}</span>
            </div>
            <div>
              <h4 className="text-[0.83rem] font-semibold">{e.titulo}</h4>
              <div className="font-menu text-[0.68rem] text-gray-400">{e.local}</div>
            </div>
          </div>
        ))}
      </Widget>

      <div className="bg-white rounded-xl shadow-sm p-[18px] mb-5">
        <AdSlot slot="sidebar" size="300x250" />
      </div>
    </aside>
  );
}
