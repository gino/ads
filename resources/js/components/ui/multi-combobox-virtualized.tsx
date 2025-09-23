import * as Ariakit from "@ariakit/react";
import { SelectRenderer } from "@ariakit/react-core/select/select-renderer";
import { matchSorter } from "match-sorter";
import { ReactNode, useMemo, useState } from "react";

const ITEM_HEIGHT = 45;

interface SelectItem {
    label: ReactNode;
    rawLabel: string;
    value: string;
}

interface Props<T extends SelectItem> {
    items: T[];
}

export function MultiComboboxVirtualized<T extends SelectItem>({
    items,
}: Props<T>) {
    const [searchValue, setSearchValue] = useState("");
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const getItem = (option: T) => ({
        id: `item-${option.value}`,
        value: option.value as string | undefined,
        label: option.label,
    });

    const matches = useMemo(() => {
        return items.map(getItem);

        const filtered = matchSorter(items, searchValue, {
            keys: ["rawLabel", "value"],
        });

        return filtered.map(getItem);
    }, [searchValue, items]);

    return (
        <Ariakit.ComboboxProvider
            // setValue={setSearchValue}
            // value={searchValue}
            // setSelectedValue={setSelectedValues}
            // selectedValue={selectedValues}
            resetValueOnHide
        >
            <Ariakit.ComboboxLabel className="font-semibold mb-2 block">
                Locations {JSON.stringify(selectedValues)}
            </Ariakit.ComboboxLabel>
            <Ariakit.Combobox
                placeholder="Search locations..."
                autoSelect
                className="w-full px-3.5 py-2.5 bg-white rounded-lg ring-1 ring-gray-200 placeholder-gray-400 font-semibold"
            />
            <Ariakit.ComboboxPopover
                unmountOnHide
                gutter={4}
                sameWidth
                className="max-h-[min(var(--popover-available-height,300px),300px)] bg-white rounded-xl shadow-base-popup flex flex-col relative overflow-auto overscroll-contain p-1 scroll-p-1"
            >
                <SelectRenderer
                    items={matches}
                    itemSize={ITEM_HEIGHT}
                    overscan={5}
                    gap={4}
                >
                    {({ label, value, ...item }) => {
                        return (
                            <Ariakit.ComboboxItem
                                key={item.id}
                                {...item}
                                style={{
                                    ...item.style,
                                    height: ITEM_HEIGHT,
                                }}
                                focusOnHover
                                className="data-[active-item]:bg-gray-100 cursor-pointer rounded-lg px-4 py-3 truncate text-sm group aria-disabled:opacity-50 flex items-center gap-3 w-full outline-none group"
                                value={value}
                            >
                                {/* <div className="w-[16px] -ml-1">
                                    <i className="fa-solid fa-check text-[12px] text-gray-400 hidden group-aria-selected:block" />
                                </div> */}
                                <div className="w-[16px] -ml-1"></div>
                                <div className="flex-1 truncate">{label}</div>
                            </Ariakit.ComboboxItem>
                        );
                    }}
                </SelectRenderer>
            </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
    );
}
