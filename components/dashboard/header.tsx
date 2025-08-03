import { RoleIndicator } from "./role-indicator";

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="grid gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-semibold">{heading}</h1>
          <RoleIndicator />
        </div>
        {text && <p className="text-base text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  );
}
