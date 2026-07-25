"use client";

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.31.647 4.47 1.77 6.31L4 29l7.86-1.73A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.7a9.62 9.62 0 0 1-4.9-1.34l-.352-.21-3.61.796.77-3.53-.23-.363A9.6 9.6 0 0 1 6.3 15c0-5.35 4.354-9.7 9.704-9.7 5.35 0 9.696 4.35 9.696 9.7 0 5.35-4.346 9.7-9.696 9.7Zm5.312-7.267c-.29-.146-1.716-.847-1.982-.944-.266-.098-.46-.146-.653.146-.194.293-.75.944-.92 1.138-.17.195-.34.22-.63.073-.29-.146-1.224-.451-2.332-1.437-.862-.768-1.444-1.717-1.613-2.01-.17-.293-.018-.451.128-.597.132-.132.29-.34.436-.512.146-.17.194-.293.29-.487.097-.195.049-.366-.024-.512-.073-.146-.653-1.574-.895-2.156-.235-.566-.475-.49-.653-.5l-.556-.01a1.07 1.07 0 0 0-.775.36c-.266.293-1.017.994-1.017 2.424s1.04 2.812 1.186 3.006c.146.195 2.048 3.128 4.963 4.386.694.3 1.235.478 1.657.612.696.221 1.33.19 1.83.115.558-.083 1.716-.7 1.958-1.377.243-.677.243-1.256.17-1.377-.073-.122-.267-.195-.557-.34Z" />
    </svg>
  );
}

type Props = {
  title: string;
  /** Caminho do artigo (ex: "/noticia/slug"). Sem isso, usa a URL atual da página —
   * correto na própria página do artigo, mas errado em listagens (home, categoria). */
  path?: string;
  /** "icon": círculo só com o ícone (fileira de redes sociais). "pill": botão com rótulo "Compartilhar". */
  variant?: "icon" | "pill";
  className?: string;
};

export default function ShareWhatsAppButton({ title, path, variant = "icon", className = "" }: Props) {
  const handleShare = () => {
    const url = path ? new URL(path, window.location.origin).toString() : window.location.href;
    const text = encodeURIComponent(`${title} ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={handleShare}
        aria-label="Compartilhar no WhatsApp"
        title="Compartilhar no WhatsApp"
        className={`flex items-center gap-1.5 bg-[#25D366] text-white px-3.5 py-1.5 rounded-full font-bold hover:brightness-95 transition ${className}`}
      >
        <WhatsAppIcon size={16} />
        Compartilhar
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Compartilhar no WhatsApp"
      title="Compartilhar no WhatsApp"
      className={`w-[34px] h-[34px] rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#25D366] hover:text-white transition-colors ${className}`}
    >
      <WhatsAppIcon />
    </button>
  );
}
