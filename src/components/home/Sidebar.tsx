import Link from "next/link";
import { formatViews, type ApiNews, type ApiEvent } from "@/lib/api";
import AdSlot from "@/components/ads/AdSlot";
import WeatherWidget from "./WeatherWidget";

function formatEventDay(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("pt-BR", { day: "2-digit" });
  const mon = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase().slice(0, 3);
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
  return { day, mon, time };
}

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

export default function Sidebar({ mostRead, events }: { mostRead?: ApiNews[]; events?: ApiEvent[] }) {
  const items = mostRead?.map((n) => ({ slug: n.slug, title: n.title, views: formatViews(n.views) })) ?? [];
  const upcoming = events ?? [];

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
        {upcoming.length > 0 ? (
          upcoming.map((e, i) => {
            const { day, mon, time } = formatEventDay(e.eventDate);
            return (
              <div key={e.id} className={`flex gap-3.5 py-3 ${i < upcoming.length - 1 ? "border-b border-gray-100" : ""}`}>
                <div className="bg-support text-white rounded-md w-[52px] h-[52px] shrink-0 flex flex-col items-center justify-center font-title">
                  <span className="text-[1.1rem] font-bold leading-none">{day}</span>
                  <span className="text-[0.6rem] uppercase text-primary">{mon}</span>
                </div>
                <div>
                  <h4 className="text-[0.83rem] font-semibold">{e.title}</h4>
                  <div className="font-menu text-[0.68rem] text-gray-400">{e.location} · {time}</div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-[0.85rem]">Nenhum evento agendado no momento.</p>
        )}
      </Widget>

      <div className="bg-white rounded-xl shadow-sm p-[18px] mb-5">
        <AdSlot slot="sidebar" size="300x250" />
      </div>
    </aside>
  );
}
