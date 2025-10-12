import { cn } from "@/lib/cn";
import * as Ariakit from "@ariakit/react";
import { useState } from "react";

interface Props {
    checked: boolean;
    onChange: (value: boolean) => void;
    className?: string;
    disabled?: boolean;
}

export function Switch({ checked, onChange, disabled, className }: Props) {
    const [focusVisible, setFocusVisible] = useState(false);

    return (
        <label
            role="checkbox"
            data-checked={checked}
            data-disabled={disabled}
            data-focus-visible={focusVisible || undefined}
            className={cn(
                "bg-gray-100 ring-1 ring-gray-200 shrink-0 ring-inset flex items-center group cursor-pointer relative rounded-full h-2.5 w-8 transition duration-250 ease-in-out",
                "data-[checked='true']:bg-brand data-[checked='true']:ring-black/10",
                className
            )}
        >
            <Ariakit.VisuallyHidden>
                <Ariakit.Checkbox
                    clickOnEnter
                    onFocusVisible={() => setFocusVisible(true)}
                    onBlur={() => setFocusVisible(false)}
                    onChange={(event) => {
                        onChange(event.target.checked);
                    }}
                    checked={checked}
                />
            </Ariakit.VisuallyHidden>

            <div
                className={cn(
                    "bg-white shadow-base flex items-center justify-center h-5 w-5 -translate-x-px -translate-y-[0.5px] aspect-square rounded-full group-data-[checked='true']:translate-x-3.5 transition duration-250 ease-in-out"
                )}
            >
                <div
                    className={cn(
                        "h-[8px] w-[8px] bg-gray-100 rounded-full ring-1 ring-inset ring-gray-200",
                        "group-data-[checked='true']:bg-brand/10 group-data-[checked='true']:ring-black/10"
                    )}
                />
            </div>
        </label>
    );

    return (
        <label
            role="checkbox"
            data-checked={checked}
            data-disabled={disabled}
            data-focus-visible={focusVisible || undefined}
            className={cn(
                "bg-gray-400 rounded-full relative p-1 h-5 w-8 cursor-pointer flex items-center",
                "data-[checked='true']:bg-brand hover:bg-gray-500",
                "data-[disabled='true']:cursor-not-allowed data-[disabled='true']:opacity-50",
                className
            )}
        >
            <Ariakit.VisuallyHidden>
                <Ariakit.Checkbox
                    clickOnEnter
                    onFocusVisible={() => setFocusVisible(true)}
                    onBlur={() => setFocusVisible(false)}
                    onChange={(event) => {
                        onChange(event.target.checked);
                    }}
                    checked={checked}
                />
            </Ariakit.VisuallyHidden>

            <div
                data-checked={checked}
                className={cn(
                    "h-3 aspect-square rounded-full bg-white data-[checked='true']:translate-x-full transition duration-150 ease-in-out flex items-center justify-center data-[checked='true']:text-brand text-gray-300"
                )}
            />
        </label>
    );

    return (
        <label
            role="checkbox"
            data-checked={checked}
            data-disabled={props.disabled}
            data-focus-visible={focusVisible || undefined}
            className={cn(
                "bg-gray-100 ring-1 ring-gray-200 relative h-4 w-8 rounded-full cursor-pointer transition duration-150 ease-in-out",
                "data-[checked='true']:bg-brand data-[checked='true']:ring-brand",
                "data-[disabled='true']:cursor-not-allowed data-[disabled='true']:opacity-50",
                className
            )}
        >
            <Ariakit.VisuallyHidden>
                <Ariakit.Checkbox
                    {...props}
                    clickOnEnter
                    onFocusVisible={() => setFocusVisible(true)}
                    onBlur={() => setFocusVisible(false)}
                    onChange={(event) => {
                        setChecked(event.target.checked);
                        props.onChange?.(event);
                    }}
                />
            </Ariakit.VisuallyHidden>

            <div
                data-checked={checked}
                className={cn(
                    "h-full aspect-square bg-white ring-1 ring-gray-200 data-[checked='true']:translate-x-full transition duration-150 ease-in-out rounded-full data-[checked='true']:ring-brand flex items-center justify-center data-[checked='true']:text-brand text-gray-300"
                )}
            >
                {/* <i
                    className={cn(
                        "fa-solid text-[7px]",
                        checked ? "fa-check" : "fa-times"
                    )}
                /> */}

                {/* <div
                    className={cn(
                        "h-1.5 w-1.5 rounded-full shadow-inner",
                        checked ? "bg-brand" : "bg-gray-100"
                    )}
                /> */}
            </div>
        </label>
    );
}
