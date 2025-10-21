import { cn } from "@/lib/cn";
import { Command } from "cmdk";
import { ComponentProps } from "react";

interface Props extends ComponentProps<typeof Command.Item> {
    children: string;
    icon?: string;
}

export function CommandItem({ children, icon, className, ...props }: Props) {
    return (
        <Command.Item
            className={cn(
                "px-4 cursor-pointer py-3 ring-1 ring-transparent data-[selected='true']:ring-gray-100 data-[selected='true']:bg-gray-100 mb-1 rounded-lg text-sm last:mb-0 flex items-center gap-4 font-semibold group",
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
            <span>{children}</span>
        </Command.Item>
    );
}
