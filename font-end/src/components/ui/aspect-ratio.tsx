"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = 16 / 9, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative h-full w-full overflow-hidden", className)}
        style={{
          aspectRatio: ratio.toString(),
        }}
        {...props}
      />
    );
  }
);
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
