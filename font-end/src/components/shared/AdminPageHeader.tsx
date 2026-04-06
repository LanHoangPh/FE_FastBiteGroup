"use client";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  gradientColors?: string;
}

export function AdminPageHeader({
  icon: Icon,
  title,
  description,
  children,
  className,
  iconClassName = "text-primary",
  gradientColors = "from-primary/5 via-chart-1/5 to-chart-2/5",
}: AdminPageHeaderProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r rounded-3xl",
          gradientColors
        )}
      />
      <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg" />
                <div className="relative bg-primary/10 p-3 rounded-xl">
                  <Icon className={cn("h-7 w-7", iconClassName)} />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                <p className="text-muted-foreground text-lg">{description}</p>
              </div>
            </div>
          </div>

          {children && (
            <div className="flex items-center gap-3">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
