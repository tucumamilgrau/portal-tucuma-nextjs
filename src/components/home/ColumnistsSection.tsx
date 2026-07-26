import type { ApiColumn } from "@/lib/api";

export default function ColumnistsSection({ items }: { items: ApiColumn[] }) {
  if (items.length === 0) {
    return <p className="text-gray-500 py-6">Nenhuma coluna publicada ainda.</p>;
  }

  return (
    <div id="colunistas">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
        {items.map((c) => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm text-center p-5 px-3.5">
            <div className="w-[76px] h-[76px] rounded-full mx-auto mb-3 flex items-center justify-center text-white font-title font-bold text-[1.4rem] border-[3px] border-primary-light bg-gradient-to-br from-primary to-support">
              {c.author.initials}
            </div>
            <h4 className="text-[0.9rem] font-semibold mb-0.5">{c.author.name}</h4>
            <div className="font-menu text-[0.7rem] text-primary mb-2">{c.author.specialty}</div>
            <p className="text-[0.75rem] text-gray-600">&quot;{c.title}&quot;</p>
          </div>
        ))}
      </div>
    </div>
  );
}
