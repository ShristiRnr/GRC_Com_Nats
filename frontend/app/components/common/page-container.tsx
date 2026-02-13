import { cn } from "~/lib/utils";
import { type ReactNode } from "react";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    scrollable?: boolean;
}

export function PageContainer({
    children,
    className,
    scrollable = true,
    ...props
}: PageContainerProps) {
    return (
        <div
            className={cn(
                "flex-1 space-y-4 pt-4 md:pt-0", // Adjusted padding for integration into layout
                scrollable ? "overflow-y-auto" : "overflow-hidden",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
