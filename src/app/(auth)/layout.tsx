export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            European FinTech Database
          </h1>
          <p className="mt-1 text-sm text-white/60">
            House of Finance & Tech Berlin
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
