import "./globals.css";

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
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
