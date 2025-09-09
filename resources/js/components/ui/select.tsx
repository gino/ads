import { cn } from "@/lib/cn";
import * as Ariakit from "@ariakit/react";
import { ReactNode, useState } from "react";

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
    value: T["value"];
    onChange: (value: T["value"]) => void;
}

export function Select<T extends SelectItem>({
    label,
    items,
    placeholder,
    renderValue: _renderValue,
    value,
    onChange,
}: Props<T>) {
    const [isOpen, setIsOpen] = useState(false);

    const renderValue = (value: string) => {
        if (!value) {
            return <div className="font-semibold">{placeholder}</div>;
        }

        if (_renderValue) {
            const item = items.find((i) => i.value === value);

            if (item) {
                return _renderValue(item);
            }
        }

        return <div>{value}</div>;
    };

    return (
        <Ariakit.SelectProvider
            open={isOpen}
            setOpen={(value) => setIsOpen(value)}
            value={value}
            setValue={(value) => {
                // @ts-ignore
                onChange(value);
            }}
        >
            <Ariakit.SelectLabel className="font-semibold mb-2">
                {label}
            </Ariakit.SelectLabel>
            <Ariakit.Select className="w-full flex items-center cursor-pointer pr-8 px-3.5 py-2.5 bg-white rounded-lg shadow-base text-sm relative active:scale-[0.99] transition-transform duration-100 ease-in-out">
                <Ariakit.SelectValue fallback="">
                    {(value) => renderValue(value)}
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
                        className="data-[active-item]:bg-gray-100 cursor-pointer rounded-lg px-4 py-3 truncate text-xs group aria-disabled:opacity-50 flex items-center gap-3"
                    >
                        <div className="w-[16px] -ml-1">
                            {value === item.value && (
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
