export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell min-h-screen text-[var(--brand-text)]">
      {children}
    </div>
  );
}
