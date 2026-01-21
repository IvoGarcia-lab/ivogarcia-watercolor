import type { Metadata } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import WatercolorBackground from "@/components/WatercolorBackground";

const cormorant = Cormorant({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aquarela Vivida | Galeria de Aguarelas",
  description: "Galeria interativa de pinturas a aguarela. Descubra obras únicas com técnicas tradicionais de watercolor.",
  keywords: ["aguarela", "watercolor", "pintura", "arte", "galeria", "Portugal"],
  authors: [{ name: "Aquarela Vivida" }],
  openGraph: {
    title: "Aquarela Vivida | Galeria de Aguarelas",
    description: "Galeria interativa de pinturas a aguarela",
    type: "website",
    locale: "pt_PT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${montserrat.variable} antialiased`}>
        <ThemeProvider>
          <WatercolorBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
