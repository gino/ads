import { cn } from "@/lib/cn";
import { Command } from "cmdk";
import { ComponentProps } from "react";

interface Props extends ComponentProps<typeof Command.Group> {
    //
}

export function CommandGroup({ children, className, ...props }: Props) {
    return (
        <Command.Group
            className={cn(
                "p-2",
                "[&>div[cmdk-group-heading]]:text-xs [&>div[cmdk-group-heading]]:font-semibold [&>div[cmdk-group-heading]]:text-gray-400 [&>div[cmdk-group-heading]]:px-4 [&>div[cmdk-group-heading]]:pt-1 [&>div[cmdk-group-heading]]:pb-2.5",
                className
            )}
            {...props}
        >
            {children}
        </Command.Group>
    );
}
