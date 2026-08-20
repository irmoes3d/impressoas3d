import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { connection } from "next/server";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { AppProviders } from "@/lib/context/AppProviders";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const sora = Sora({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700", "800"] });

const siteUrl = "https://2irmaosimpressoes3d.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "2 Irmãos Impressões 3D | Produtos e Projetos Personalizados",
    template: "%s | 2 Irmãos Impressões 3D",
  },
  description:
    "Transformamos ideias em realidade com impressão 3D. Produtos exclusivos, personalização sob medida e orçamento para projetos especiais. Sua ideia ganha forma.",
  keywords: ["impressão 3D", "produtos 3D", "personalizados", "orçamento impressão 3D", "presentes 3D"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "2 Irmãos Impressões 3D",
    title: "2 Irmãos Impressões 3D | Sua ideia ganha forma",
    description:
      "De itens personalizados a peças exclusivas, produzimos cada projeto com precisão, criatividade e qualidade.",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <AppProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </AppProviders>
      </body>
    </html>
  );
}
