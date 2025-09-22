import { cn } from "@/lib/cn";
import * as Ariakit from "@ariakit/react";
import { ReactNode, useState } from "react";

// https://ariakit.org/examples/select-multiple

interface SelectItem {
    label: ReactNode | string;
    value: string;
    disabled?: boolean;
}

interface Props<T extends SelectItem> {
    items: T[];
    label: string;
    placeholder: ReactNode | string;
    renderValue?: (item: T) => ReactNode;
    value: string[];
    onChange: (value: string[]) => void;
}

export function MultiSelect<T extends SelectItem>({
    label,
    items,
    placeholder,
    renderValue: _renderValue,
    value,
    onChange,
}: Props<T>) {
    const [isOpen, setIsOpen] = useState(false);

    const renderValue = (value: string[]) => {
        if (value.length === 0) {
            return <span className="font-semibold">{placeholder}</span>;
        }
        if (value.length === 1) {
            return <span className="font-semibold">{value[0]}</span>;
        }

        return (
            <span className="font-semibold">
                {value.length} locations selected
            </span>
        );
    };

    return (
        <Ariakit.SelectProvider
            open={isOpen}
            setOpen={(value) => setIsOpen(value)}
            value={value}
            setValue={(value) => {
                onChange(value as any);
            }}
        >
            <Ariakit.SelectLabel className="font-semibold block mb-2">
                {label}
            </Ariakit.SelectLabel>
            <Ariakit.Select className="w-full flex items-center cursor-pointer pr-8 px-3.5 py-2.5 bg-white rounded-lg shadow-base text-sm relative active:scale-[0.99] transition-transform duration-100 ease-in-out">
                <Ariakit.SelectValue fallback="">
                    {() => renderValue(value)}
                </Ariakit.SelectValue>
                <Ariakit.SelectArrow className="absolute right-3 pointer-events-none text-xs top-1/2 -translate-y-1/2 !h-[unset] !w-[unset] flex">
                    <i
                        className={cn(
                            "fa-solid fa-angle-down text-gray-400 transition-transform duration-200 ease-in-out",
                            isOpen && "rotate-180"
                        )}
                    />
                </Ariakit.SelectArrow>
            </Ariakit.Select>
            <Ariakit.SelectPopover
                gutter={8}
                portal
                slide={false}
                sameWidth
                className="rounded-xl max-h-[var(--popover-available-height)] overflow-y-auto bg-white shadow-base-popup p-1 space-y-1 scroll-p-1"
            >
                {items.map((item) => (
                    <Ariakit.SelectItem
                        key={item.value}
                        value={item.value}
                        disabled={item.disabled}
                        className="data-[active-item]:bg-gray-100 cursor-pointer rounded-lg px-4 py-3 truncate text-sm group aria-disabled:opacity-50 flex items-center gap-3"
                    >
                        <div className="w-[16px] -ml-1">
                            {value.includes(item.value) && (
                                <i className="fa-solid fa-check text-[12px] text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1 truncate">{item.label}</div>
                    </Ariakit.SelectItem>
                ))}
            </Ariakit.SelectPopover>
        </Ariakit.SelectProvider>
    );
}
