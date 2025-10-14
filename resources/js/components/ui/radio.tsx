import * as Ariakit from "@ariakit/react";

interface SelectItem {
    value: string;
    label: string;
}

interface Props<T extends SelectItem> {
    options: T[];
    value: T["value"];
    onChange: (value: T["value"]) => void;
}

export function Radio<T extends SelectItem>({
    options,
    value,
    onChange,
}: Props<T>) {
    return (
        <Ariakit.RadioProvider
            value={value}
            setValue={(value) => onChange(value as T["value"])}
        >
            <Ariakit.RadioGroup className="flex items-center gap-2 justify-between">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className="flex-1 flex cursor-pointer items-center px-3 py-2.5 rounded-lg gap-3 ring-1 ring-gray-100"
                    >
                        <div className="relative h-4 w-4">
                            <Ariakit.Radio
                                className="appearance-none h-full w-full rounded-full bg-white aria-[checked='true']:bg-brand aria-[checked='true']:ring-1 aria-[checked='true']:ring-brand aria-[checked='false']:shadow-base"
                                value={option.value}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-[7px] w-[7px] bg-white rounded-full" />
                            </div>
                        </div>
                        <span className="font-semibold">{option.label}</span>
                    </label>
                ))}
            </Ariakit.RadioGroup>
        </Ariakit.RadioProvider>
    );
}
