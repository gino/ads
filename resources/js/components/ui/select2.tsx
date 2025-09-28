import * as Ariakit from "@ariakit/react";
import { ReactNode } from "react";

interface SelectItem {
    label: ReactNode | string;
    value: string;
}

interface Props<T extends object> {
    label: string;
    items: T[];
    getItem: (item: T) => SelectItem;
    getSelectedItem: (item: T) => ReactNode;
    value: SelectItem["value"];
    onChange: (value: SelectItem["value"]) => void;
}

export function Select2<T extends object>({
    label,
    value,
    onChange,
}: Props<T>) {
    return (
        <Ariakit.SelectProvider
            value={value}
            setValue={(value) => onChange(value)}
        >
            <div>
                <Ariakit.SelectLabel className="block mb-2 font-semibold">
                    {label}
                </Ariakit.SelectLabel>

                <Ariakit.Select className="w-full flex items-center cursor-pointer pr-8 px-3.5 py-2.5 bg-white rounded-lg text-sm relative active:scale-[0.99] transition-transform duration-100 ease-in-out shadow-base">
                    <Ariakit.SelectValue fallback="">
                        {/* todo */}
                    </Ariakit.SelectValue>
                </Ariakit.Select>
            </div>
        </Ariakit.SelectProvider>
    );
}
