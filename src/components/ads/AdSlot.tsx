import { getActiveAd, resolveMediaUrl } from "@/lib/api";

// Server component: busca o anúncio ativo (ver /admin/publicidade) para o slot.
// Sem anúncio ativo, cai no placeholder decorativo — nunca deixa o espaço vazio.
export default async function AdSlot({ slot, size = "300x600" }: { slot: string; size?: string }) {
  const ad = await getActiveAd(slot);

  if (!ad) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl min-h-[120px] flex items-center justify-center text-gray-400 font-menu text-[0.78rem] text-center bg-gray-100">
        📢 Publicidade<br />{size}
      </div>
    );
  }

  return (
    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block rounded-xl overflow-hidden">
      {ad.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolveMediaUrl(ad.imageUrl)} alt={ad.title} className="w-full h-auto" />
      ) : (
        <div className="min-h-[120px] flex items-center justify-center bg-gradient-to-br from-primary to-support text-white font-menu font-semibold text-[0.85rem] text-center p-4">
          {ad.title}
        </div>
      )}
    </a>
  );
}
