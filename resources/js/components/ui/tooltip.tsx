import { cn } from "@/lib/cn";
import * as Ariakit from "@ariakit/react";
import { ReactElement } from "react";

interface Props {
    children: ReactElement;
    enabled?: boolean;
    content: ReactElement;
    className?: string;
}

export function Tooltip({
    children,
    enabled = true,
    content,
    className,
}: Props) {
    if (!enabled) {
        return children;
    }

    return (
        <Ariakit.TooltipProvider>
            <Ariakit.TooltipAnchor className="flex">
                {children}
            </Ariakit.TooltipAnchor>
            <Ariakit.Tooltip
                className={cn(
                    "bg-white shadow-base-popup rounded-lg text-[12px]",
                    className
                )}
            >
                {content}
            </Ariakit.Tooltip>
        </Ariakit.TooltipProvider>
    );
}
