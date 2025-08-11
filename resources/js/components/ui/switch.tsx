import { cn } from "@/lib/cn";
import * as Ariakit from "@ariakit/react";
import { ComponentPropsWithoutRef, useState } from "react";

interface Props extends ComponentPropsWithoutRef<"input"> {
    //
}

export function Switch({ ...props }: Props) {
    const [checked, setChecked] = useState(props.defaultChecked ?? false);
    const [focusVisible, setFocusVisible] = useState(false);

    return (
        <label
            data-checked={checked}
            data-focus-visible={focusVisible || undefined}
            className={cn(
                "bg-gray-100 ring-inset ring-neutral-200 w-7 rounded-full flex relative cursor-pointer",
                "data-[checked='true']:bg-emerald-600 data-[checked='true']:ring-emerald-600"
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
                    "h-3.5 w-3.5 rounded-full ring-1 ring-neutral-200 bg-white shadow-base transition duration-200 ease-in-out translate-x-0",
                    "data-[checked='true']:translate-x-[calc(100%)]",
                    "data-[checked='true']:ring-emerald-600"
                )}
            />
        </label>
    );
}
