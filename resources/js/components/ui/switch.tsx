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
            role="checkbox"
            data-checked={checked}
            data-disabled={props.disabled}
            data-focus-visible={focusVisible || undefined}
            className={cn(
                "bg-gray-100 ring-1 ring-gray-200 relative h-4 w-8 rounded-full cursor-pointer transition duration-150 ease-in-out",
                "data-[checked='true']:bg-brand data-[checked='true']:ring-brand",
                "data-[disabled='true']:cursor-not-allowed data-[disabled='true']:opacity-50"
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
            </div>
        </label>
    );
}
