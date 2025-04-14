interface PageErrorProps {
  title: string;
  error: string;
}

export function PageError({ title, error }: PageErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  );
}
