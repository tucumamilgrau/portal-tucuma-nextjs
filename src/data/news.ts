// Dados fictícios (mock) — substituir por chamadas a uma API/CMS real em produção.
import { categoryImage, SLIDER_MEIO_AMBIENTE_IMAGE } from "@/lib/images";

export type NewsItem = {
  slug: string;
  cat: string;
  color?: string;
  icon: string;
  title: string;
  resumo: string;
  views: string;
  tempo: string;
  autor: string;
  hora: string;
  image?: string;
};

const NEWS_MOCK_BASE: Omit<NewsItem, "image">[] = [
  { slug: "camara-orcamento-2027", cat: "Política", icon: "🏛️", title: "Câmara de Tucumã aprova orçamento de R$ 180 milhões para 2027", resumo: "Proposta prevê investimentos prioritários em saúde, educação e infraestrutura viária.", views: "9.2k", tempo: "5 min", autor: "Roberto Castro", hora: "07h10" },
  { slug: "pm-apreende-motocicleta", cat: "Polícia", color: "alert", icon: "🚔", title: "PM apreende motocicleta com sinais de adulteração em blitz na PA-279", resumo: "Ação faz parte da Operação Rodovida, que reforça a fiscalização nas rodovias da região.", views: "7.8k", tempo: "3 min", autor: "Marcos Pinheiro", hora: "06h45" },
  { slug: "safra-milho-recorde", cat: "Agronegócio", icon: "🌾", title: "Safra de milho supera expectativas no sul do Pará em 2026", resumo: "Produtores comemoram alta de 18% na produtividade média por hectare na região.", views: "6.1k", tempo: "4 min", autor: "Juliana Lopes", hora: "06h20" },
  { slug: "comercio-local-cresce", cat: "Economia", icon: "💰", title: "Comércio local registra crescimento de 12% no primeiro semestre", resumo: "Associação comercial de Tucumã aponta recuperação puxada pelo setor de serviços.", views: "5.4k", tempo: "6 min", autor: "Juliana Lopes", hora: "05h58" },
  { slug: "selecao-tucuma-sub17", cat: "Esportes", color: "highlight", icon: "⚽", title: "Seleção de Tucumã se prepara para Copa Regional Sub-17", resumo: "Equipe realiza treinos intensivos visando a estreia na competição no mês que vem.", views: "4.9k", tempo: "3 min", autor: "Redação", hora: "05h30" },
  { slug: "hospital-nova-ala", cat: "Saúde", icon: "🏥", title: "Hospital Municipal amplia atendimento com nova ala de urgência", resumo: "Unidade passa a contar com 12 novos leitos e equipe multidisciplinar reforçada.", views: "4.2k", tempo: "5 min", autor: "Ana Souza", hora: "05h10" },
  { slug: "material-didatico-regional", cat: "Educação", icon: "🎓", title: "Rede municipal de ensino adota material didático regionalizado", resumo: "Iniciativa busca aproximar o conteúdo escolar da realidade da Amazônia paraense.", views: "3.7k", tempo: "4 min", autor: "Ana Souza", hora: "04h55" },
  { slug: "hackathon-sul-para", cat: "Tecnologia", color: "highlight", icon: "💻", title: "Tucumã sedia primeiro hackathon de inovação do sul do Pará", resumo: "Evento reúne desenvolvedores locais para criar soluções voltadas ao agronegócio.", views: "3.1k", tempo: "3 min", autor: "Redação", hora: "04h30" },
];

export const NEWS_MOCK: NewsItem[] = NEWS_MOCK_BASE.map((n) => ({ ...n, image: categoryImage(n.cat) }));

export const MOST_READ_MOCK = [
  "Prefeitura de Tucumã anuncia pacote de investimentos para duplicação da PA-279",
  "Operação conjunta apreende carga irregular de madeira na PA-279",
  "Preço do boi gordo sobe 3% na região sul do Pará",
  "Câmara de Tucumã aprova orçamento de R$ 180 milhões para 2027",
  "Hospital Municipal amplia atendimento com nova ala de urgência",
  "Tucumã recebe primeiro polo de internet 5G da região sul do Pará",
  "Campeonato Municipal de Tucumã define semifinalistas neste fim de semana",
];

export const COLUMNISTS = [
  { initials: "RC", nome: "Roberto Castro", especialidade: "Política Regional", ultimo: "O futuro da PA-279 e o desenvolvimento do sul do Pará" },
  { initials: "JL", nome: "Juliana Lopes", especialidade: "Economia & Agro", ultimo: "Como a valorização do boi impacta o pequeno produtor" },
  { initials: "MP", nome: "Marcos Pinheiro", especialidade: "Segurança Pública", ultimo: "Dados de criminalidade caem 12% no primeiro semestre" },
  { initials: "AS", nome: "Ana Souza", especialidade: "Educação", ultimo: "Escolas municipais adotam ensino híbrido em 2026" },
];

export const EVENTS = [
  { day: "28", mon: "Jul", titulo: "Feira do Produtor Rural", local: "Praça Central · 08h" },
  { day: "02", mon: "Ago", titulo: "Audiência Pública — Orçamento 2027", local: "Câmara Municipal · 19h" },
  { day: "10", mon: "Ago", titulo: "Final do Campeonato Municipal", local: "Estádio Municipal · 16h" },
];

export const VIDEOS = [
  { icon: "🎥", titulo: "Cobertura completa: obras da PA-279 começam em agosto", views: "12.4k", extra: "08:32" },
  { icon: "🎙️", titulo: "Entrevista exclusiva com o prefeito de Tucumã", views: "8.1k", extra: "14:05" },
  { icon: "📡", titulo: "Live: sessão da Câmara Municipal ao vivo", views: "3.6k", extra: "🔴 AO VIVO" },
];

export const PODCASTS = [
  { titulo: "Milgrau Notícias #48 — Retrospectiva do semestre", info: "32 min · 21/07/2026" },
  { titulo: "Milgrau Notícias #47 — Entrevista com produtores rurais", info: "28 min · 14/07/2026" },
  { titulo: "Milgrau Notícias #46 — Segurança pública em debate", info: "41 min · 07/07/2026" },
];

export const CLASSIFIEDS = [
  { icon: "🏠", cat: "Imóveis", titulo: "Casa 3 quartos — Bairro Centro", preco: "R$ 280.000" },
  { icon: "🚗", cat: "Veículos", titulo: "Fiat Toro 2022 — Diesel", preco: "R$ 149.900" },
  { icon: "💼", cat: "Empregos", titulo: "Vaga: Auxiliar Administrativo", preco: "R$ 1.850/mês" },
];

export const REGIONS = ["Todas", "Tucumã", "Ourilândia", "São Félix", "Xinguara", "Redenção", "Canaã", "Marabá"];

export const CATEGORIES = ["Política", "Polícia", "Economia", "Agronegócio", "Esportes", "Saúde", "Educação", "Entretenimento", "Tecnologia", "Brasil", "Mundo"];

export const FEATURED_SLIDES = [
  { icon: "🏛️", cat: "Política", color: "primary", titulo: "Câmara aprova projeto de revitalização da praça central", image: categoryImage("Política") },
  { icon: "🌳", cat: "Meio Ambiente", color: "green", titulo: "Mutirão de reflorestamento planta 5 mil mudas às margens do rio", image: SLIDER_MEIO_AMBIENTE_IMAGE },
  { icon: "💻", cat: "Tecnologia", color: "highlight", titulo: "Tucumã recebe primeiro polo de internet 5G da região sul do Pará", image: categoryImage("Tecnologia") },
];

export const COMMENTS_MOCK = [
  { iniciais: "JS", nome: "João Silva", quando: "há 2 horas", texto: "Excelente notícia! Essa rodovia precisa dessa melhoria urgente, uso todos os dias.", likes: 14 },
  { iniciais: "PC", nome: "Patrícia Carvalho", quando: "há 4 horas", texto: "Espero que o prazo seja cumprido dessa vez. Vamos acompanhar de perto.", likes: 7 },
];

export const ADMIN_KPIS = [
  { lbl: "Visualizações Hoje", val: "48.2k", delta: "▲ 12,4% vs ontem", up: true },
  { lbl: "Usuários Ativos", val: "3.941", delta: "▲ 6,1%", up: true },
  { lbl: "Notícias Publicadas", val: "17", delta: "▼ 2 vs média", up: false },
  { lbl: "Receita de Anúncios", val: "R$ 2.140", delta: "▲ 8,7%", up: true },
];

export const ADMIN_EDITORIAS_CHART = [
  { label: "Política", pct: 70 },
  { label: "Polícia", pct: 55 },
  { label: "Agro", pct: 90 },
  { label: "Economia", pct: 40 },
  { label: "Esportes", pct: 65 },
  { label: "Saúde", pct: 30 },
  { label: "Educação", pct: 22 },
];

export const ADMIN_NEWS_TABLE = [
  { titulo: "Prefeitura anuncia pacote de investimentos para PA-279", cat: "Política", autor: "Maria Fernandes", status: "published", data: "23/07 08h42" },
  { titulo: "Operação apreende carga irregular de madeira", cat: "Polícia", autor: "Marcos Pinheiro", status: "published", data: "23/07 07h15" },
  { titulo: "Preço do boi gordo sobe 3% na região", cat: "Agronegócio", autor: "Juliana Lopes", status: "scheduled", data: "24/07 06h00" },
  { titulo: "Entrevista exclusiva: secretário de saúde fala sobre nova ala", cat: "Saúde", autor: "Ana Souza", status: "draft", data: "—" },
  { titulo: "Hackathon de inovação reúne 200 desenvolvedores", cat: "Tecnologia", autor: "Redação", status: "published", data: "22/07 18h20" },
];

export const ADMIN_COMMENTS_TABLE = [
  { texto: '"Excelente notícia! Essa rodovia precisa dessa melhoria..."', usuario: "João Silva", status: "Aprovado" },
  { texto: '"Espero que o prazo seja cumprido dessa vez..."', usuario: "Patrícia Carvalho", status: "Aprovado" },
  { texto: "[Conteúdo sinalizado — possível spam/link suspeito]", usuario: "usuário_anon382", status: "Sinalizado" },
];
