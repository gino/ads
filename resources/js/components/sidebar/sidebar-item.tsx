import { cn } from "@/lib/cn";
import { ComponentProps, ReactElement } from "react";

interface Props extends ComponentProps<"button"> {
    icon: string;
    children: string;
    active?: boolean;
    suffix?: ReactElement;
}

export function SidebarItem(_props: Props) {
    const {
        icon,
        children,
        active = false,
        suffix,
        disabled,
        className,
        ...props
    } = _props;
    return (
        <button
            title={children}
            className={cn(
                "px-3 disabled:cursor-not-allowed disabled:opacity-60 enabled:cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold ring-gray-100 enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out",
                active
                    ? "bg-gray-100 ring-1"
                    : "enabled:hover:bg-gray-100 enabled:hover:ring-1",
                className
            )}
            disabled={disabled}
            {...props}
        >
            <i
                className={cn(
                    "text-base fa-regular fa-fw",
                    icon,
                    !active &&
                        "text-gray-400 group-enabled:group-hover:text-black"
                )}
            />
            <span
                className={cn(
                    "flex-1 text-left truncate",
                    !active &&
                        "text-gray-600 group-enabled:group-hover:text-black"
                )}
            >
                {children}
            </span>
            {suffix}
        </button>
    );
}
