export function DashboardPageHeader({
  description,
  eyebrow,
  title,
}: {
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <header className="flex flex-col gap-1">
      {eyebrow ? (
        <p className="font-medium text-primary text-xs uppercase tracking-[0.16em]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-medium text-3xl tracking-tight">{title}</h1>
      {description ? (
        <p className="text-muted-foreground text-sm">{description}</p>
      ) : null}
    </header>
  );
}
