import ImgPlaceholder from "@/components/ui/ImgPlaceholder";
import { STUDIO_IMAGE } from "@/lib/images";
import { formatViews, resolveMediaUrl, type ApiVideo } from "@/lib/api";

export default function VideosSection({ items }: { items: ApiVideo[] }) {
  if (items.length === 0) {
    return <p className="text-gray-500 py-6">Nenhum vídeo publicado ainda.</p>;
  }

  return (
    <div id="videos" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
      {items.map((v) => (
        <div key={v.id} className="rounded-xl overflow-hidden shadow-sm bg-white">
          <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="relative block">
            <ImgPlaceholder icon={v.icon} src={resolveMediaUrl(v.thumbnailUrl) ?? STUDIO_IMAGE} alt={v.title} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-[52px] h-[52px] rounded-full bg-primary/90 flex items-center justify-center text-white text-xl">▶</span>
            </div>
          </a>
          <div className="p-3.5">
            <h4 className="text-[0.85rem] font-semibold">{v.title}</h4>
            <div className="font-menu text-[0.68rem] text-gray-400 flex gap-3.5 mt-1.5">
              <span>👁️ {formatViews(v.views)}</span>
              <span>{v.live ? "🔴 AO VIVO" : v.duration ? `🕒 ${v.duration}` : ""}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
