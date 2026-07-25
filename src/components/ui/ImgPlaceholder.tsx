import Image from "next/image";

type Props = {
  icon: string;
  label?: string;
  ratio?: "16/9" | "21/9" | "1/1" | "4/5" | "4/3" | "16/8" | "16/7";
  className?: string;
  /** Caminho da imagem real em /public (ex: "/images/hero-skyline.webp"). Sem isso, cai no placeholder em gradiente. */
  src?: string;
  alt?: string;
  priority?: boolean;
};

const ratioClass: Record<string, string> = {
  "16/9": "aspect-video",
  "21/9": "aspect-[21/9]",
  "1/1": "aspect-square",
  "4/5": "aspect-[4/5]",
  "4/3": "aspect-[4/3]",
  "16/8": "aspect-[16/8]",
  "16/7": "aspect-[16/7]",
};

export default function ImgPlaceholder({ icon, label, ratio = "16/9", className = "", src, alt, priority }: Props) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${ratioClass[ratio]} ${className}`}>
        <Image
          src={src}
          alt={alt ?? label ?? ""}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`img-ph ${ratioClass[ratio]} ${className}`}>
      <span className="ph-icon">{icon}</span>
      {label && <span className="ph-label">{label}</span>}
    </div>
  );
}
