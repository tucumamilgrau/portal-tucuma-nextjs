// Cliente da API real (portal-tucuma-api, NestJS + Prisma) que substitui
// gradualmente os dados mock de src/data/news.ts. Podcasts continua mock —
// não faz parte do schema da API ainda (ver README do projeto da API).
import type { NewsItem } from "@/data/news";
import { categoryImage, ARTICLE_PA279_IMAGE } from "@/lib/images";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
// Uploads são servidos na raiz da API (/uploads/...), fora do prefixo /api — precisamos da origem sem o sufixo.
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

/** Resolve o caminho relativo retornado pela API (ex: "/uploads/news/x.webp") para uma URL absoluta. */
export function resolveMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}

export type ApiCategory = { id: string; slug: string; name: string; color: string };
export type ApiAuthor = { id: string; slug: string; name: string; initials: string; specialty: string; bio: string };

export type ApiNews = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  coverIcon: string;
  coverImage: string | null;
  readTimeMin: number;
  views: number;
  status: string;
  publishedAt: string;
  featured: boolean;
  sourceUrl: string | null;
  sourceName: string | null;
  category: ApiCategory;
  author: ApiAuthor;
};

export type ApiComment = { id: string; authorName: string; text: string; likes: number; createdAt: string };

export type ApiNewsDetail = ApiNews & { comments: ApiComment[]; related: ApiNews[] };

async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    // API offline (ex.: rodando só o front) — cai para o fallback informado pelo chamador.
    return fallback;
  }
}

export function getCategories() {
  return safeGet<ApiCategory[]>("/categories", []);
}

export function getAuthors() {
  return safeGet<ApiAuthor[]>("/authors", []);
}

export function getNews(params?: { category?: string; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.limit) qs.set("limit", String(params.limit));
  return safeGet<ApiNews[]>(`/news?${qs.toString()}`, []);
}

export function getMostRead(limit = 7) {
  return safeGet<ApiNews[]>(`/news/most-read?limit=${limit}`, []);
}

export function getFeaturedNews(limit = 5) {
  return safeGet<ApiNews[]>(`/news/featured?limit=${limit}`, []);
}

export function getNewsBySlug(slug: string) {
  return safeGet<ApiNewsDetail | null>(`/news/${slug}`, null);
}

export async function postComment(slug: string, authorName: string, text: string): Promise<ApiComment> {
  const res = await fetch(`${API_URL}/news/${slug}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authorName, text }),
  });
  if (!res.ok) throw new Error("Falha ao publicar comentário");
  return res.json();
}

export type AuthUser = { id: string; name: string; email: string; city: string; role: "READER" | "ADMIN" };
export type AuthResponse = { token: string; user: AuthUser };

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function registerUser(input: { name: string; email: string; password: string; city?: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível criar a conta."));
  return res.json();
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res, "E-mail ou senha inválidos."));
  return res.json();
}

export async function getMe(token: string): Promise<AuthUser | null> {
  const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

// ---------- Painel administrativo (requer token de admin) ----------

export type NewsFormInput = {
  title: string;
  subtitle?: string;
  excerpt: string;
  body?: string;
  coverIcon?: string;
  readTimeMin?: number;
  status?: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  featured?: boolean;
  categorySlug: string;
  authorSlug: string;
};

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function adminListNews(token: string): Promise<ApiNews[]> {
  const res = await fetch(`${API_URL}/news/admin`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar as notícias."));
  return res.json();
}

export async function adminCreateNews(token: string, data: NewsFormInput): Promise<ApiNews> {
  const res = await fetch(`${API_URL}/news`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível criar a notícia."));
  return res.json();
}

export async function adminUpdateNews(token: string, id: string, data: Partial<NewsFormInput>): Promise<ApiNews> {
  const res = await fetch(`${API_URL}/news/admin/${id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível salvar as alterações."));
  return res.json();
}

export async function adminDeleteNews(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/news/admin/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível excluir a notícia."));
}

export async function adminUploadCover(token: string, id: string, file: File): Promise<ApiNews> {
  const form = new FormData();
  form.append("file", file);
  // Sem Content-Type manual: o navegador define o boundary do multipart automaticamente.
  const res = await fetch(`${API_URL}/news/admin/${id}/cover`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível enviar a imagem."));
  return res.json();
}

export async function adminRemoveCover(token: string, id: string): Promise<ApiNews> {
  const res = await fetch(`${API_URL}/news/admin/${id}/cover`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível remover a imagem."));
  return res.json();
}

export type ApiStats = {
  totalViews: number;
  byStatus: { DRAFT: number; SCHEDULED: number; PUBLISHED: number };
  viewsByCategory: { category: string; views: number }[];
  publishedLast7Days: { date: string; count: number }[];
};

export async function adminGetStats(token: string): Promise<ApiStats> {
  const res = await fetch(`${API_URL}/news/admin/stats`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar as estatísticas."));
  return res.json();
}

// ---------- Categorias (admin) ----------

export type CategoryFormInput = { slug: string; name: string; color: "primary" | "alert" | "highlight" | "green" };

export async function adminCreateCategory(token: string, data: CategoryFormInput): Promise<ApiCategory> {
  const res = await fetch(`${API_URL}/categories`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível criar a categoria."));
  return res.json();
}

export async function adminUpdateCategory(token: string, id: string, data: Partial<CategoryFormInput>): Promise<ApiCategory> {
  const res = await fetch(`${API_URL}/categories/${id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível salvar a categoria."));
  return res.json();
}

export async function adminDeleteCategory(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/categories/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível excluir a categoria."));
}

// ---------- Autores (admin) ----------

export type AuthorFormInput = { slug: string; name: string; initials: string; specialty: string; bio?: string };

export async function adminCreateAuthor(token: string, data: AuthorFormInput): Promise<ApiAuthor> {
  const res = await fetch(`${API_URL}/authors`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível criar o autor."));
  return res.json();
}

export async function adminUpdateAuthor(token: string, id: string, data: Partial<AuthorFormInput>): Promise<ApiAuthor> {
  const res = await fetch(`${API_URL}/authors/${id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível salvar o autor."));
  return res.json();
}

export async function adminDeleteAuthor(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/authors/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível excluir o autor."));
}

// ---------- Mídia (admin) ----------

export type ApiMediaItem = { filename: string; url: string; size: number; uploadedAt: string };

export async function adminListMedia(token: string): Promise<ApiMediaItem[]> {
  const res = await fetch(`${API_URL}/media`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar a mídia."));
  return res.json();
}

export async function adminUploadMedia(token: string, file: File): Promise<ApiMediaItem> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/media/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível enviar o arquivo."));
  return res.json();
}

export async function adminDeleteMedia(token: string, filename: string): Promise<void> {
  const res = await fetch(`${API_URL}/media/${filename}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível excluir o arquivo."));
}

// ---------- Publicidade ----------

export type ApiAd = {
  id: string;
  slot: string;
  title: string;
  imageUrl: string | null;
  linkUrl: string;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
};

export type AdFormInput = {
  slot: "sidebar" | "article-sidebar" | "footer-banner";
  title: string;
  imageUrl?: string;
  linkUrl: string;
  active?: boolean;
  startsAt?: string;
  endsAt?: string;
};

export function getActiveAd(slot: string): Promise<ApiAd | null> {
  return safeGet<ApiAd | null>(`/ads?slot=${encodeURIComponent(slot)}`, null);
}

export async function adminListAds(token: string): Promise<ApiAd[]> {
  const res = await fetch(`${API_URL}/ads/admin`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar os anúncios."));
  return res.json();
}

export async function adminCreateAd(token: string, data: AdFormInput): Promise<ApiAd> {
  const res = await fetch(`${API_URL}/ads`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível criar o anúncio."));
  return res.json();
}

export async function adminUpdateAd(token: string, id: string, data: Partial<AdFormInput>): Promise<ApiAd> {
  const res = await fetch(`${API_URL}/ads/${id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível salvar o anúncio."));
  return res.json();
}

export async function adminDeleteAd(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/ads/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível excluir o anúncio."));
}

// ---------- Classificados ----------

export type ApiClassified = {
  id: string;
  title: string;
  category: "Imóveis" | "Veículos" | "Empregos" | "Serviços";
  price: string;
  description: string;
  icon: string;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
};

export type ClassifiedFormInput = {
  title: string;
  category: "Imóveis" | "Veículos" | "Empregos" | "Serviços";
  price: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  active?: boolean;
};

export function getClassifieds(category?: string) {
  const qs = category && category !== "Todos" ? `?category=${encodeURIComponent(category)}` : "";
  return safeGet<ApiClassified[]>(`/classifieds${qs}`, []);
}

export async function adminListClassifieds(token: string): Promise<ApiClassified[]> {
  const res = await fetch(`${API_URL}/classifieds/admin`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar os classificados."));
  return res.json();
}

export async function adminCreateClassified(token: string, data: ClassifiedFormInput): Promise<ApiClassified> {
  const res = await fetch(`${API_URL}/classifieds`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível criar o classificado."));
  return res.json();
}

export async function adminUpdateClassified(token: string, id: string, data: Partial<ClassifiedFormInput>): Promise<ApiClassified> {
  const res = await fetch(`${API_URL}/classifieds/${id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível salvar o classificado."));
  return res.json();
}

export async function adminDeleteClassified(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/classifieds/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível excluir o classificado."));
}

// ---------- Vídeos ----------

export type ApiVideo = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  icon: string;
  duration: string | null;
  views: number;
  live: boolean;
  active: boolean;
  createdAt: string;
};

export type VideoFormInput = {
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  icon?: string;
  duration?: string;
  views?: number;
  live?: boolean;
  active?: boolean;
};

export function getVideos() {
  return safeGet<ApiVideo[]>("/videos", []);
}

export async function adminListVideos(token: string): Promise<ApiVideo[]> {
  const res = await fetch(`${API_URL}/videos/admin`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar os vídeos."));
  return res.json();
}

export async function adminCreateVideo(token: string, data: VideoFormInput): Promise<ApiVideo> {
  const res = await fetch(`${API_URL}/videos`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível criar o vídeo."));
  return res.json();
}

export async function adminUpdateVideo(token: string, id: string, data: Partial<VideoFormInput>): Promise<ApiVideo> {
  const res = await fetch(`${API_URL}/videos/${id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível salvar o vídeo."));
  return res.json();
}

export async function adminDeleteVideo(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/videos/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível excluir o vídeo."));
}

// ---------- Agenda de Eventos ----------

export type ApiEvent = {
  id: string;
  title: string;
  location: string;
  eventDate: string;
  active: boolean;
  createdAt: string;
};

export type EventFormInput = {
  title: string;
  location: string;
  eventDate: string;
  active?: boolean;
};

export function getEvents() {
  return safeGet<ApiEvent[]>("/events", []);
}

export async function adminListEvents(token: string): Promise<ApiEvent[]> {
  const res = await fetch(`${API_URL}/events/admin`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar os eventos."));
  return res.json();
}

export async function adminCreateEvent(token: string, data: EventFormInput): Promise<ApiEvent> {
  const res = await fetch(`${API_URL}/events`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível criar o evento."));
  return res.json();
}

export async function adminUpdateEvent(token: string, id: string, data: Partial<EventFormInput>): Promise<ApiEvent> {
  const res = await fetch(`${API_URL}/events/${id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível salvar o evento."));
  return res.json();
}

export async function adminDeleteEvent(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/events/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível excluir o evento."));
}

// ---------- Colunistas & Opinião ----------

export type ApiColumn = {
  id: string;
  title: string;
  excerpt: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  createdAt: string;
  author: ApiAuthor;
};

export type ColumnFormInput = {
  title: string;
  excerpt?: string;
  status?: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  authorSlug: string;
};

export function getColumns(limit = 4) {
  return safeGet<ApiColumn[]>(`/columns?limit=${limit}`, []);
}

export async function adminListColumns(token: string): Promise<ApiColumn[]> {
  const res = await fetch(`${API_URL}/columns/admin`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar as colunas."));
  return res.json();
}

export async function adminCreateColumn(token: string, data: ColumnFormInput): Promise<ApiColumn> {
  const res = await fetch(`${API_URL}/columns`, { method: "POST", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível criar a coluna."));
  return res.json();
}

export async function adminUpdateColumn(token: string, id: string, data: Partial<ColumnFormInput>): Promise<ApiColumn> {
  const res = await fetch(`${API_URL}/columns/${id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível salvar a coluna."));
  return res.json();
}

export async function adminDeleteColumn(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/columns/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível excluir a coluna."));
}

// ---------- Comentários / moderação (admin) ----------

export type ApiAdminComment = {
  id: string;
  authorName: string;
  text: string;
  likes: number;
  createdAt: string;
  approved: boolean;
  flagged: boolean;
  reportCount: number;
  news: { slug: string; title: string };
};

export async function adminListComments(token: string, filter: "all" | "pending" | "flagged" = "all"): Promise<ApiAdminComment[]> {
  const res = await fetch(`${API_URL}/comments/admin?filter=${filter}`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar os comentários."));
  return res.json();
}

export async function adminSetCommentApproved(token: string, id: string, approved: boolean): Promise<ApiAdminComment> {
  const res = await fetch(`${API_URL}/comments/admin/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ approved }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível atualizar o comentário."));
  return res.json();
}

export async function adminDeleteComment(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/comments/admin/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível excluir o comentário."));
}

export async function reportComment(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/comments/${id}/report`, { method: "POST" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível enviar a denúncia."));
}

// ---------- Inteligência Artificial (filtro heurístico de moderação) ----------

export type ApiModerationSettings = { id: string; enabled: boolean; keywords: string };
export type ApiModerationStats = { totalAnalyzed: number; totalFlagged: number; pendingReview: number };

export async function adminGetModerationSettings(token: string): Promise<ApiModerationSettings> {
  const res = await fetch(`${API_URL}/moderation/settings`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar as configurações."));
  return res.json();
}

export async function adminUpdateModerationSettings(
  token: string,
  data: Partial<{ enabled: boolean; keywords: string }>,
): Promise<ApiModerationSettings> {
  const res = await fetch(`${API_URL}/moderation/settings`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível salvar as configurações."));
  return res.json();
}

export async function adminGetModerationStats(token: string): Promise<ApiModerationStats> {
  const res = await fetch(`${API_URL}/moderation/stats`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar as estatísticas."));
  return res.json();
}

// ---------- Usuários (admin) ----------

export async function adminListUsers(token: string): Promise<AuthUser[]> {
  const res = await fetch(`${API_URL}/auth/admin/users`, { headers: authHeaders(token), cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível carregar os usuários."));
  return res.json();
}

export async function adminUpdateUserRole(token: string, id: string, role: "READER" | "ADMIN"): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/admin/users/${id}/role`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível atualizar o usuário."));
  return res.json();
}

export async function adminDeleteUser(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/admin/users/${id}`, { method: "DELETE", headers: authHeaders(token) });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível excluir o usuário."));
}

// ---------- Segurança ----------

export async function changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res, "Não foi possível trocar a senha."));
}

const COLOR_MAP: Record<string, NewsItem["color"]> = {
  alert: "alert",
  highlight: "highlight",
};

/** Adapta a resposta da API para o mesmo formato que NewsCard/Hero já sabem renderizar. */
export function mapApiNewsToNewsItem(n: ApiNews): NewsItem {
  return {
    slug: n.slug,
    cat: n.category.name,
    color: COLOR_MAP[n.category.color],
    icon: n.coverIcon,
    title: n.title,
    resumo: n.excerpt,
    views: formatViews(n.views),
    tempo: `${n.readTimeMin} min`,
    autor: n.author.name,
    hora: formatTime(n.publishedAt),
    image: resolveMediaUrl(n.coverImage) ?? (n.slug === "duplicacao-pa-279" ? ARTICLE_PA279_IMAGE : categoryImage(n.category.name)),
  };
}

export function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
}
