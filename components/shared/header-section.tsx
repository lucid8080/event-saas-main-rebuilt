interface HeaderSectionProps {
  label?: string;
  title: string;
  subtitle?: string;
}

export function HeaderSection({ label, title, subtitle }: HeaderSectionProps) {
  return (
    <div className="flex flex-col text-center items-center">
      {label ? (
        <div className="mb-4 text-gradient_indigo-purple font-semibold">
          {label}
        </div>
      ) : null}
      <h2 className="text-3xl md:text-4xl lg:text-[40px] font-heading">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-6 text-balance text-lg text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
