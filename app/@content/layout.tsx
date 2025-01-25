export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 ml-64 mt-16 min-h-screen p-6 bg-gray-50">
      {children}
    </main>
  );
} 