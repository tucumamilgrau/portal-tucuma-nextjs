// Mapa de categoria → imagem real gerada via Higgsfield (public/images).
// Ver ../../public/images e IMAGENS-PROMPTS.md do protótipo estático para os prompts originais.
export const CATEGORY_IMAGES: Record<string, string> = {
  "Política": "/images/cat-politica.webp",
  "Polícia": "/images/cat-policia.webp",
  Agronegócio: "/images/cat-agronegocio.webp",
  Economia: "/images/cat-economia.webp",
  Esportes: "/images/cat-esportes.webp",
  Saúde: "/images/cat-saude.webp",
  Educação: "/images/cat-educacao.webp",
  Tecnologia: "/images/cat-tecnologia.webp",
};

export function categoryImage(categoryName: string): string | undefined {
  return CATEGORY_IMAGES[categoryName];
}

export const HERO_IMAGE = "/images/hero-skyline.webp";
export const ARTICLE_PA279_IMAGE = "/images/article-pa279-highway.webp";
export const SLIDER_MEIO_AMBIENTE_IMAGE = "/images/slider-meio-ambiente.webp";
export const STUDIO_IMAGE = "/images/studio-videos.webp";
export const FOOTER_BG_IMAGE = "/images/footer-bg.webp";
