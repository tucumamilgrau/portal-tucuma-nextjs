# Portal Tucumã Milgrau — Next.js + TypeScript + Tailwind

Migração do protótipo estático (`../portal-tucuma-milgrau`) para uma base **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**, seguindo a stack recomendada no briefing original. Notícias, "mais lidas", comentários, destaques e classificados já vêm de uma **API real** (`../portal-tucuma-api`, NestJS + Prisma); o restante (colunistas, clima, enquete, eventos, vídeos) continua mock em `src/data/news.ts`.

## Como rodar

Requer Node.js 20.9+ (usado aqui: v24.18.0) e npm.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Build de produção: `npm run build && npm start`.

**Para ver dados reais** (grid de notícias, mais lidas, artigo, comentários), a API precisa estar rodando em paralelo — veja `../portal-tucuma-api/README.md`. A URL é configurada em `.env.local` (`NEXT_PUBLIC_API_URL`, padrão `http://localhost:3001/api`). Se a API estiver fora do ar: a **home** cai de volta para o mock automaticamente (`src/lib/api.ts` → `safeGet`); a **página de artigo** (`/noticia/[slug]`) depende da API e mostra 404 se ela não responder, já que o conteúdo completo do artigo só existe no banco.

## Estrutura

```
src/
├── app/
│   ├── layout.tsx              Layout raiz: fontes (next/font/google) e estilos globais
│   ├── globals.css              Tema Tailwind v4 (@theme) + placeholder de imagem (@layer components)
│   ├── (site)/                  Grupo de rotas com header/footer públicos
│   │   ├── layout.tsx            TopBar + Header + Footer + FAB WhatsApp + BackToTop
│   │   ├── page.tsx               Home
│   │   └── noticia/[slug]/page.tsx  Página de artigo
│   ├── login/page.tsx            Área do leitor (shell próprio, sem header do site)
│   └── admin/
│       ├── layout.tsx            Shell do painel (sidebar dark)
│       └── page.tsx               Dashboard
├── components/
│   ├── layout/                  Header, TopBar, Footer, MobileMenu, SearchBar, WhatsAppFab, BackToTop
│   ├── home/                    Hero, NewsCard, FeaturedSlider, RegionFilter, Sidebar, PollWidget, etc.
│   ├── article/                 ArticleToc (scrollspy), CommentSection, ReadingProgress
│   ├── admin/                   AdminSidebar, AdminGuard (protege a rota), NewsManager (CRUD), AdminGreeting
│   └── ui/                      ImgPlaceholder, Tag
├── data/
│   └── news.ts                  Dados mock que sobraram (colunistas, eventos, clima, enquete, vídeos, admin)
└── lib/
    ├── api.ts                    Cliente da API real (fetch + adaptador para o formato que os componentes esperam)
    └── auth-client.ts             Sessão no localStorage (save/load/clear + evento para sincronizar componentes)
```

## O que já funciona (testado no navegador)

- Home: **hero "Última Hora" 100% dinâmico** (ver nota abaixo), **grid de "Últimas Notícias" vindo da API real**, ordenado por data de publicação; **slider "Notícias em Destaque" vindo da API real** (só notícias marcadas ⭐ no admin); filtro de região; colunistas; **"Mais Lidas" vindo da API real** (ordenado por visualizações); clima; **enquete com voto persistido em localStorage**; eventos; vídeos; **classificados vindos da API real** (filtro por categoria funcional).
- Artigo (`/noticia/[slug]`): título, subtítulo, autor, corpo e views vindos da API; **comentários persistidos de verdade** (POST na API, sobrevive a reload); notícias relacionadas calculadas pela API (mesma categoria). O artigo "flagship" (`duplicacao-pa-279`) mantém tratamento editorial rico (índice com scrollspy, galeria, citação, mapa) — os demais artigos usam um layout mais simples, direto do campo `body` da API.
- Login/cadastro: **autenticação real via JWT** contra a API — cadastro cria conta com senha (hash `bcryptjs` no backend), login valida credenciais, sessão (token + dados do usuário) fica em `localStorage` e sobrevive a reload. O ícone de perfil no Header vira o avatar com as iniciais do usuário logado (dropdown com nome/e-mail e botão "Sair"); testei cadastro → reload → dropdown → logout → login de novo, tudo persistindo/limpando corretamente.
- **Admin protegido de verdade**: `/admin` checa a sessão no cliente — sem login, redireciona para `/login`; logado como leitor comum, mostra "Acesso restrito"; só usuários com `role: 'ADMIN'` entram. **Todos os 13 itens do menu lateral têm tela real por trás** (nenhum link morto):
  - **📰 Notícias** (`/admin/noticias`): CRUD completo com upload de foto de capa — igual descrito antes.
  - **🗂️ Categorias** / **✍️ Autores** (`/admin/categorias`, `/admin/autores`): CRUD completo (criar/editar/excluir), com bloqueio amigável ao tentar excluir algo que ainda tem notícias vinculadas.
  - **🖼️ Mídia** (`/admin/midia`): biblioteca de imagens — upload, preview, copiar URL, excluir — independente do upload de capa de notícia.
  - **🔍 SEO** (`/admin/seo`): checklist real calculado a partir das notícias da API (título curto/longo, sem resumo, sem foto, sem subtítulo).
  - **📈 Estatísticas** (`/admin/estatisticas`) e o **Dashboard** (`/admin`): números reais vindos de `GET /news/admin/stats` (views totais, publicadas/rascunhos, views por categoria, publicações dos últimos 7 dias) — nada de mock.
  - **📢 Publicidade** (`/admin/publicidade`): CRUD de anúncios por espaço (`sidebar`, `article-sidebar`, `footer-banner`), com período de veiculação opcional. Anúncio ativo aparece de verdade nos 3 espaços do site (`AdSlot`); sem anúncio cadastrado, mostra o placeholder decorativo.
  - **💬 Comentários** / **🚨 Denúncias** / **🤖 Inteligência Artificial** (`/admin/comentarios`, `/admin/denuncias`, `/admin/ia`): um filtro heurístico local (não é um LLM externo) analisa todo comentário novo contra uma lista de termos configurável + padrões de spam; sinalizados ficam pendentes de aprovação. Leitores podem denunciar qualquer comentário na página do artigo, o que também alimenta a fila de denúncias.
  - **👥 Usuários** (`/admin/usuarios`): promove/rebaixa papel (READER/ADMIN) e exclui contas — protegido contra auto-alteração e remoção do último admin.
  - **🔒 Segurança** (`/admin/seguranca`): troca a própria senha (valida a senha atual).
  - **📋 Classificados** (`/admin/classificados`): CRUD completo (título, categoria, preço, descrição, ícone/foto via URL da Mídia, ativo/inativo). Alimenta a seção "Classificados" real da home — filtro por categoria funcional, sem anúncio nenhum mostra estado vazio (nada de dados fictícios).

  A ordem das notícias é sempre cronológica por data de publicação real: **editar uma notícia não muda sua posição na lista**, só uma transição real para "Publicado" (de rascunho/agendado) atualiza a data — ver README da API.
- 100% responsivo (mobile/tablet/desktop), sem overflow horizontal em nenhuma página — validado via `document.documentElement.scrollWidth` em 375px.
- `npm run build` e `npx eslint .` passam limpos. `/` e `/noticia/[slug]` agora são rotas dinâmicas (buscam da API a cada request); `/login` e `/admin` continuam estáticas.

**Nota sobre o Hero**: "Última Hora" é 100% dinâmico — mostra sempre a notícia publicada mais recentemente (`GET /news`, já ordenado por `publishedAt`), com as 3 mini-manchetes ao lado sendo as próximas mais recentes. Isso inclui notícias que vieram do ingestor automático de RSS (`portal-tucuma-api/scripts/ingest-news.ts`) assim que um admin aprova e publica o rascunho em `/admin/noticias`. A home busca 12 notícias (`getNews({ limit: 12 })`): as 4 mais recentes alimentam o Hero, as 8 seguintes preenchem o grid "Últimas Notícias" — sem repetir nenhuma entre as duas seções.

**Nota sobre "Notícias em Destaque" e "Classificados"**: diferente do Hero (sempre populado pelas notícias mais recentes), essas duas seções só mostram conteúdo que um admin escolheu manualmente — a primeira via checkbox "⭐ Destaque" em `/admin/noticias`, a segunda via `/admin/classificados`. Sem nada cadastrado, a seção de destaque some da home e a de classificados mostra um estado vazio — nenhuma das duas cai em dados mock, porque fingir que existem notícias "em destaque" ou anúncios reais seria enganoso. A antiga seção "Podcasts" (sempre mock, sem funcionalidade real) foi removida; o item de menu equivalente agora aponta para "Classificados" (`/#classificados`).

**Login do admin** (conta semeada pela API — troque a senha fora do seu localhost):
```
http://localhost:3000/admin  (ou faça login em /login e clique no avatar → "Painel Administrativo")
E-mail: admin@tucumamilgrau.com.br
Senha:  admin123
```

## Imagens

13 imagens reais foram geradas via **Higgsfield** (modelo `soul_location`) a partir dos prompts documentados em `../portal-tucuma-milgrau/IMAGENS-PROMPTS.md`, baixadas e comprimidas para WebP (`sharp`, ~40–140 KB cada) em `public/images/`. Mapeamento em `src/lib/images.ts`: uma imagem por categoria (política, polícia, agronegócio, economia, esportes, saúde, educação, tecnologia) reutilizada no Hero, cards, artigo e relacionadas; imagens dedicadas para o hero (skyline), o artigo "flagship" (obras da PA-279), o slide de meio ambiente, o estúdio (vídeos/podcasts) e o fundo do rodapé. `ImgPlaceholder` aceita a prop `src` — sem ela, cai de volta no gradiente placeholder original (ainda usado nos itens de classificados e na galeria secundária do artigo, que não têm prompt correspondente).

## O que ainda é mock (sem backend real)

Colunistas (cards com foto/bio na home — o CRUD de autores existe, mas o perfil rico com foto grande/bio longa da home continua mock), clima, cotação do dólar, enquete, eventos, vídeos continuam em `src/data/news.ts` — não fazem parte do schema da API (ver "O que ainda falta" no README da API). Sem PWA/service worker nesta versão. Login social (Google/Facebook) continua só visual — precisaria de apps OAuth registrados nesses provedores.

## Notas técnicas específicas do Next 16 / Tailwind v4

- Tailwind v4 não usa `tailwind.config.js` — o tema (cores, fontes) é definido em `src/app/globals.css` via `@theme`.
- **Cuidado com CSS customizado fora de `@layer`**: uma regra solta tipo `.minha-classe { width: 100% }` pode empatar em especificidade com utilitários Tailwind (`w-[110px]`) e vencer pela ordem do arquivo. Por isso o `.img-ph` está dentro de `@layer components` — assim as `utilities` do Tailwind sempre ganham, independente da ordem. (Foi exatamente esse bug que quebrou o layout do Hero na primeira tentativa.)
- `params` em `page.tsx` é assíncrono (`Promise<{ slug: string }>`) — breaking change do Next 16.
- Next 16 usa Turbopack por padrão em `dev` e `build`.

## Próximos passos (continuação do roadmap original)

1. ~~API real (NestJS/Laravel) + PostgreSQL + Redis, substituindo `src/data/news.ts`.~~ ✅ Feito para notícias/comentários — ver `../portal-tucuma-api`. Falta estender o schema para colunistas, eventos e o admin.
2. Elasticsearch/Meilisearch para a busca inteligente do `SearchBar`.
3. ~~Autenticação OAuth2/JWT real no `/login`.~~ ✅ JWT feito (e-mail/senha). OAuth2 (login social) fica de fora — precisa de apps registrados no Google/Facebook.
4. Upload de mídia (Cloudflare R2/S3) + geração das imagens finais a partir dos prompts documentados.
5. App mobile nativo (Capacitor/React Native) ou PWA sobre esta base.
