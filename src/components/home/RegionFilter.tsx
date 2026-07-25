"use client";

import { useState } from "react";
import { REGIONS } from "@/data/news";

export default function RegionFilter() {
  const [active, setActive] = useState(REGIONS[0]);

  return (
    <div className="flex flex-wrap gap-2">
      {REGIONS.map((r) => (
        <button
          key={r}
          onClick={() => setActive(r)}
          className={`font-menu text-[0.72rem] font-semibold px-3.5 py-1.5 rounded-full border-[1.5px] transition ${
            active === r ? "bg-support text-white border-support" : "bg-white border-gray-200 hover:bg-support hover:text-white hover:border-support"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
