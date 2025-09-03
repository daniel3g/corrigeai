import type { Metadata } from "next";
import { Open_Sans, Alegreya_Sans } from "next/font/google";
import "./globals.css";

// Exemplo: usando Open Sans como padrão
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const alegreyaSans = Alegreya_Sans({
  weight: ["400", "700"],          
  style: ["normal"],    
  subsets: ["latin"],
  variable: "--font-alegreya-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meu Projeto",
  description: "Next.js 14 + Tailwind",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className={`${openSans.variable} ${alegreyaSans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
