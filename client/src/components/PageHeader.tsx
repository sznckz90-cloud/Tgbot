interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
        <p className="text-muted-foreground mt-1 text-lg">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}
