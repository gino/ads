import { cn } from "@/lib/cn";
import { Command } from "cmdk";
import { ComponentProps, ReactNode } from "react";

interface Props extends ComponentProps<typeof Command.Item> {
    children: ReactNode;
    icon?: string;
}

export function CommandItem({ children, icon, className, ...props }: Props) {
    return (
        <Command.Item
            className={cn(
                "px-4 cursor-pointer py-3 ring-1 ring-transparent data-[selected='true']:ring-gray-100 data-[selected='true']:bg-gray-100 mb-1 rounded-lg text-sm last:mb-0 flex items-center gap-4 font-semibold group data-[disabled='true']:opacity-50 data-[disabled='true']:cursor-not-allowed",
                className
            )}
            {...props}
        >
            {icon && (
                <i
                    className={cn(
                        icon,
                        "fa-fw text-gray-400 group-data-[selected='true']:text-black -ml-0.5"
                    )}
                />
            )}
            {children}
        </Command.Item>
    );
}
