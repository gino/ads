import { cn } from "@/lib/cn";
import * as Ariakit from "@ariakit/react";
import { ReactNode, useMemo, useState } from "react";

interface SelectItem {
    label: ReactNode | string;
    value: string;
    disabled?: boolean;
}

interface Props<T extends object> {
    label: string;
    placeholder?: ReactNode;
    items: T[];
    getItem: (item: T) => SelectItem;
    getSelectedItem?: (item: T) => ReactNode;
    value: SelectItem["value"];
    onChange: (value: SelectItem["value"]) => void;
    disabled?: boolean;
    getDisabledLabel?: () => ReactNode;
    clearable?: boolean;
}

export function Select<T extends object>({
    label,
    value,
    placeholder,
    items: _items,
    getItem,
    getSelectedItem,
    onChange,
    disabled,
    getDisabledLabel,
    clearable = true,
}: Props<T>) {
    const [isOpen, setIsOpen] = useState(false);

    const items = useMemo(() => {
        return _items.map(getItem);
    }, [_items]);

    return (
        <Ariakit.SelectProvider
            value={value}
            setValue={(value) => onChange(value)}
            open={isOpen}
            setOpen={setIsOpen}
        >
            <div>
                <Ariakit.SelectLabel className="block mb-2 font-semibold">
                    {label}
                </Ariakit.SelectLabel>

                <Ariakit.Select
                    disabled={disabled}
                    className="w-full flex items-center cursor-pointer pr-8 px-3.5 py-2.5 bg-white rounded-lg text-sm relative enabled:active:scale-[0.99] transition-transform duration-100 ease-in-out shadow-base disabled:opacity-50 disabled:cursor-not-allowed disabled:!pointer-events-auto"
                >
                    <Ariakit.SelectValue fallback="">
                        {(value) => {
                            const item =
                                _items.find(
                                    (item) => getItem(item).value === value
                                ) ?? null;

                            if (!item || !value) {
                                if (disabled && getDisabledLabel) {
                                    return getDisabledLabel();
                                }

                                return (
                                    <span className="font-semibold">
                                        {placeholder || "Select an item"}
                                    </span>
                                );
                            }

                            if (getSelectedItem) {
                                return getSelectedItem(item);
                            }

                            return getItem(item).label;
                        }}
                    </Ariakit.SelectValue>
                    <Ariakit.SelectArrow className="absolute right-3 pointer-events-none text-xs top-1/2 -translate-y-1/2 !h-[unset] !w-[unset] flex">
                        {!value || !clearable ? (
                            <i
                                className={cn(
                                    "fa-solid fa-angle-down text-gray-400 transition-transform duration-200 ease-in-out",
                                    isOpen && "rotate-180"
                                )}
                            />
                        ) : (
                            <div
                                onClick={() => onChange("")}
                                title="Clear selected value"
                                className="h-6 w-6 rounded hover:bg-gray-100 hover:text-black text-gray-400 -mr-1 flex items-center justify-center pointer-events-auto cursor-pointer text-[12px]"
                            >
                                <i className="fa-solid fa-times" />
                            </div>
                        )}
                    </Ariakit.SelectArrow>
                </Ariakit.Select>
                <Ariakit.SelectPopover
                    gutter={8}
                    portal
                    slide={false}
                    // flip={false}
                    sameWidth
                    className="rounded-xl max-h-[var(--popover-available-height)] overflow-y-auto bg-white shadow-base-popup p-1 space-y-1 scroll-p-1"
                >
                    {items.map((item) => {
                        return (
                            <Ariakit.SelectItem
                                key={item.value}
                                value={item.value}
                                disabled={item.disabled}
                                data-selected={value === item.value}
                                focusOnHover
                                className={cn(
                                    "cursor-pointer rounded-lg px-4 py-3 truncate text-sm group aria-disabled:opacity-50 flex items-center gap-3",
                                    value === item.value
                                        ? "bg-brand-lighter"
                                        : "data-[active-item]:bg-gray-100"
                                )}
                            >
                                <div className="w-[16px] -ml-1">
                                    {value === item.value && (
                                        <i className="fa-solid fa-check text-[12px] text-black/20" />
                                    )}
                                </div>
                                <div className="flex-1 truncate">
                                    {item.label}
                                </div>
                            </Ariakit.SelectItem>
                        );
                    })}
                </Ariakit.SelectPopover>
            </div>
        </Ariakit.SelectProvider>
    );
}
