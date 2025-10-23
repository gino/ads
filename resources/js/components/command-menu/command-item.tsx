import { cn } from "@/lib/cn";
import { Command } from "cmdk";
import { ComponentProps, ReactNode, useEffect, useRef } from "react";
import { useCommandMenu } from "./store";

interface Props extends ComponentProps<typeof Command.Item> {
    id: string;
    children: ReactNode;
    icon?: string;
    onSelectedChange?: (selected: boolean) => void;
}

export function CommandItem({
    id,
    children,
    icon,
    onSelectedChange,
    className,
    ...props
}: Props) {
    const { setSelectedItemId } = useCommandMenu();

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new MutationObserver(() => {
            const isSelected = ref.current?.dataset.selected === "true";
            onSelectedChange?.(isSelected);

            setSelectedItemId(id ?? null);
        });

        observer.observe(ref.current, {
            attributes: true,
            attributeFilter: ["data-selected"],
        });

        return () => observer.disconnect();
    }, [onSelectedChange, id, setSelectedItemId]);

    return (
        <Command.Item
            ref={ref}
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
