import { cn } from "@/lib/cn";
import { ComponentProps } from "react";

interface Props extends ComponentProps<"button"> {
    isActive: boolean;
}

export function Tab({ isActive, children, className, ...props }: Props) {
    return (
        <button
            className={cn(
                "min-w-72 px-5 py-3.5 rounded-t-xl font-semibold active:scale-[0.99] transition-transform duration-100 ease-in-out flex items-center gap-2.5 cursor-pointer relative",
                "border-r border-l border-t -ml-px -mt-px",
                isActive
                    ? "bg-white border-transparent shadow-base"
                    : "border-transparent",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
