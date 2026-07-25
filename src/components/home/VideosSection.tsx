import ImgPlaceholder from "@/components/ui/ImgPlaceholder";
import { VIDEOS } from "@/data/news";
import { STUDIO_IMAGE } from "@/lib/images";

export default function VideosSection() {
  return (
    <div id="videos" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
      {VIDEOS.map((v) => (
        <div key={v.titulo} className="rounded-xl overflow-hidden shadow-sm bg-white">
          <a href="#" className="relative block">
            <ImgPlaceholder icon={v.icon} src={STUDIO_IMAGE} alt={v.titulo} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-[52px] h-[52px] rounded-full bg-primary/90 flex items-center justify-center text-white text-xl">▶</span>
            </div>
          </a>
          <div className="p-3.5">
            <h4 className="text-[0.85rem] font-semibold">{v.titulo}</h4>
            <div className="font-menu text-[0.68rem] text-gray-400 flex gap-3.5 mt-1.5">
              <span>👁️ {v.views}</span>
              <span>{v.extra.startsWith("🔴") ? v.extra : `🕒 ${v.extra}`}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
