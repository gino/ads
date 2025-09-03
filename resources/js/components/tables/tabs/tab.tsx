import { cn } from "@/lib/cn";
import { ComponentProps } from "react";

interface Props extends ComponentProps<"button"> {
    isActive: boolean;
}

export function Tab({ isActive, children, className, ...props }: Props) {
    return (
        <button
            className={cn(
                "px-5 w-full font-semibold cursor-pointer relative py-2.5 rounded-lg flex items-center justify-center active:scale-[0.99] transition-transform duration-100 ease-in-out",
                isActive && "bg-white shadow-base",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
