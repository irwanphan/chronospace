export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 ml-64 mt-16 p-6 transition-all duration-300">
      {children}
    </main>
  );
} 