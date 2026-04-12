export default function DashboardLayout({
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
