import { cn } from "@/lib/cn";
import * as Ariakit from "@ariakit/react";
import { ComponentPropsWithoutRef, useState } from "react";

interface Props extends ComponentPropsWithoutRef<"input"> {
    //
}

export function Switch({ ...props }: Props) {
    const [checked, setChecked] = useState(props.checked ?? false);
    const [focusVisible, setFocusVisible] = useState(false);

    return (
        <label
            role="checkbox"
            data-checked={checked}
            data-focus-visible={focusVisible || undefined}
            className={cn(
                "bg-gray-100 ring-1 ring-gray-200 w-8 rounded-full flex relative cursor-pointer",
                "data-[checked='true']:bg-teal-600 data-[checked='true']:ring-teal-600"
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
                    "h-4 w-4 rounded-full ring-1 ring-gray-200 text-gray-300 bg-white shadow-base transition duration-200 ease-in-out translate-x-0",
                    "data-[checked='true']:translate-x-[calc(100%)]",
                    "data-[checked='true']:ring-teal-600",
                    "data-[checked='true']:text-teal-600",
                    "flex items-center justify-center"
                )}
            >
                <i
                    className={cn(
                        "fa-solid text-[7px]",
                        checked ? "fa-check" : "fa-times"
                    )}
                />
            </div>
        </label>
    );
}
