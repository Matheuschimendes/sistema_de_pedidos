import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const appSans = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-app-sans",
});

const appDisplay = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-app-display",
});

export const metadata = {
  title: "Sistema de Pedidos",
  description: "Sistema para restaurantes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${appSans.variable} ${appDisplay.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
