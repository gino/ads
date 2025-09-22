import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import { ReactNode, useMemo, useState, useTransition } from "react";

interface SelectItem {
    label: ReactNode | string;
    rawLabel: string;
    value: string;
    disabled?: boolean;
}

interface Props<T extends SelectItem> {
    items: T[];
    value: T["value"][];
    onChange: (values: T["value"][]) => void;
}

export function MultiCombobox<T extends SelectItem>({
    items,
    value,
    onChange,
}: Props<T>) {
    const [isPending, startTransition] = useTransition();

    const [searchValue, setSearchValue] = useState("");

    const matches = useMemo(
        () => matchSorter(items, searchValue, { keys: ["rawLabel", "value"] }),
        [searchValue]
    );

    return (
        <Ariakit.ComboboxProvider
            selectedValue={value}
            setSelectedValue={onChange}
            setValue={(value) => {
                startTransition(() => {
                    setSearchValue(value);
                });
            }}
        >
            <Ariakit.ComboboxLabel className="font-semibold block mb-2">
                Locations
            </Ariakit.ComboboxLabel>
            <Ariakit.Combobox
                placeholder="Search locations..."
                className="w-full px-3.5 py-2.5 bg-white rounded-lg ring-1 ring-gray-200 placeholder-gray-400 font-semibold"
            />
            <Ariakit.ComboboxPopover
                slide={false}
                sameWidth
                gutter={8}
                portal
                aria-busy={isPending}
                className="rounded-xl max-h-[var(--popover-available-height)] overflow-y-auto bg-white shadow-base-popup p-1 space-y-1 scroll-p-1"
            >
                {matches.map((item) => (
                    <Ariakit.ComboboxItem
                        key={item.value}
                        value={item.value}
                        disabled={item.disabled}
                        focusOnHover
                        className="data-[active-item]:bg-gray-100 cursor-pointer rounded-lg px-4 py-3 truncate text-sm group aria-disabled:opacity-50 flex items-center gap-3"
                    >
                        <div className="w-[16px] -ml-1">
                            {value.includes(item.value) && (
                                <i className="fa-solid fa-check text-[12px] text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1 truncate">{item.label}</div>
                    </Ariakit.ComboboxItem>
                ))}

                {!matches.length && (
                    <div className="text-sm font-semibold flex items-center justify-center p-4 text-center">
                        No results found for "{searchValue}"
                    </div>
                )}
            </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
    );
}
