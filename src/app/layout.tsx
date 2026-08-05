import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Montserrat } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-montserrat",
});

const SITE_URL = "https://portaltucumamilgrau.com.br";
const SITE_TITLE = "Portal Tucumã Milgrau — A notícia em tempo real";
const SITE_DESCRIPTION =
  "Portal Tucumã Milgrau: notícias em tempo real de Tucumã, Ourilândia do Norte, São Félix do Xingu, Xinguara, Redenção, Canaã dos Carajás e Marabá, no sul do Pará. Política, polícia, economia, agronegócio, esportes e mais.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s — Portal Tucumã Milgrau" },
  description: SITE_DESCRIPTION,
  keywords: [
    "notícias Tucumã",
    "notícias sul do Pará",
    "Tucumã Pará",
    "Ourilândia do Norte",
    "São Félix do Xingu",
    "Xinguara",
    "Redenção Pará",
    "Canaã dos Carajás",
    "Marabá notícias",
  ],
  manifest: "/manifest.json",
  icons: { icon: "/icon.png", apple: "/icon.png" },
  verification: {
    google: "eKtfcLpihMH2RLDFRBegZCYdFTW7pmqtfkZXlLwt_Cg",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Portal Tucumã Milgrau",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#F97316",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "Portal Tucumã Milgrau",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo-icon.webp`,
  areaServed: {
    "@type": "Place",
    name: "Tucumã e sul do Pará",
  },
  sameAs: ["https://www.instagram.com/tucumamilgrau2", "https://www.facebook.com/tucumamilgrau"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${inter.variable} ${montserrat.variable}`}>
      <body className="font-text text-support bg-[#fafafa] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
