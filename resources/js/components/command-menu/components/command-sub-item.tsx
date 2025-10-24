import { cn } from "@/lib/cn";
import { Command } from "cmdk";
import { ComponentProps } from "react";

interface Props extends ComponentProps<typeof Command.Item> {
    //
}

export function CommandSubItem({ children, className, ...props }: Props) {
    return (
        <Command.Item
            className={cn(
                "data-[selected='true']:bg-gray-100 data-[disabled='true']:opacity-50 data-[disabled='true']:cursor-not-allowed group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate",
                className
            )}
            {...props}
        >
            {children}
        </Command.Item>
    );
}
