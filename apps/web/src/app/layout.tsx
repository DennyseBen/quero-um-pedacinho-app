import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quero Um Pedacinho — Pizzaria Express",
  description: "Peça pizzas napolitanas da Pizzaria Quero Um Pedacinho. Drive-thru e balcão em Marabá/PA.",
  keywords: ["pizzaria", "pizza", "pedidos", "Marabá", "drive-thru", "delivery"],
};

export const viewport: Viewport = {
  themeColor: "#E74011",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#E74011" />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
