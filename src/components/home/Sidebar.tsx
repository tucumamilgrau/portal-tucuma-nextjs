import Link from "next/link";
import { MOST_READ_MOCK, EVENTS } from "@/data/news";
import { formatViews, type ApiNews } from "@/lib/api";
import PollWidget from "./PollWidget";
import AdSlot from "@/components/ads/AdSlot";

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
  const items = mostRead?.length
    ? mostRead.map((n) => ({ slug: n.slug, title: n.title, views: formatViews(n.views) }))
    : MOST_READ_MOCK.map((title, i) => ({ slug: null, title, views: `${((9 - i) * 1.3 + 1).toFixed(1)}k` }));

  return (
    <aside>
      <Widget title="🔥 Mais Lidas">
        <ol>
          {items.map((item, i) => (
            <li key={item.title} className="flex gap-3.5 py-2.5 border-b border-gray-100 last:border-0 items-start">
              <span className="rank-num w-7 shrink-0">{i + 1}</span>
              <div>
                <h4 className="text-[0.85rem] font-semibold leading-snug hover:text-primary">
                  {item.slug ? <Link href={`/noticia/${item.slug}`}>{item.title}</Link> : <a href="#">{item.title}</a>}
                </h4>
                <div className="font-menu text-[0.65rem] text-gray-400 mt-1">👁️ {item.views} visualizações</div>
              </div>
            </li>
          ))}
        </ol>
      </Widget>

      <div className="rounded-xl p-[18px] mb-5 text-white bg-gradient-to-br from-highlight to-[#1d4ed8]">
        <div className="font-menu text-[0.72rem] uppercase opacity-85 mb-1.5">Previsão do Tempo · Tucumã-PA</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[0.85rem] opacity-90">Parcialmente nublado</div>
            <div className="font-title text-[2.4rem] font-bold">31°</div>
          </div>
          <div className="text-[2.4rem]">⛅</div>
        </div>
        <div className="flex justify-between mt-3.5 text-[0.72rem] text-center">
          <div className="opacity-90">Qui<br />☀️<br />32°/22°</div>
          <div className="opacity-90">Sex<br />⛅<br />30°/21°</div>
          <div className="opacity-90">Sáb<br />🌧️<br />27°/20°</div>
          <div className="opacity-90">Dom<br />⛅<br />29°/21°</div>
        </div>
      </div>

      <Widget title="🗳️ Enquete">
        <PollWidget />
      </Widget>

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
