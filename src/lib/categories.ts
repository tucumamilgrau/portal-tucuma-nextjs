// Mapa rótulo (como aparece nos menus) → slug da categoria no banco (ver
// portal-tucuma-api/prisma/seed.ts). Usado para montar os links de navegação
// de Header, MobileMenu e Footer sem repetir a lista em cada componente.
export const CATEGORY_SLUGS: Record<string, string> = {
  "Política": "politica",
  "Polícia": "policia",
  Economia: "economia",
  "Agronegócio": "agronegocio",
  Esportes: "esportes",
  "Saúde": "saude",
  "Educação": "educacao",
  Entretenimento: "entretenimento",
  Tecnologia: "tecnologia",
  Brasil: "brasil",
  Mundo: "mundo",
};

export function categoryHref(label: string): string {
  const slug = CATEGORY_SLUGS[label];
  return slug ? `/categoria/${slug}` : "/";
}
