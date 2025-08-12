import { cn } from "@/lib/cn";
import * as Ariakit from "@ariakit/react";
import { ChangeEvent, useState } from "react";

interface Props {
    checked?: boolean;
    disabled?: boolean;
    indeterminate?: boolean;
    onChange?: (event: ChangeEvent) => void;
    className?: string;
}

export function Checkbox({
    checked: _checked = false,
    disabled = false,
    indeterminate = false,
    onChange,
    className,
}: Props) {
    const [focusVisible, setFocusVisible] = useState(false);

    const checked = _checked || indeterminate;

    return (
        <label
            role="checkbox"
            data-checked={checked}
            data-focus-visible={focusVisible || undefined}
            className={cn(
                "h-4 w-4 relative flex shadow-base bg-white rounded data-[checked='true']:bg-teal-600 data-[checked='true']:ring-1 data-[checked='true']:ring-teal-600 cursor-pointer",
                className
            )}
        >
            <Ariakit.VisuallyHidden>
                <Ariakit.Checkbox
                    clickOnEnter
                    checked={checked}
                    disabled={disabled}
                    onChange={(event) => onChange?.(event)}
                    onFocusVisible={() => setFocusVisible(true)}
                    onBlur={() => setFocusVisible(false)}
                />
            </Ariakit.VisuallyHidden>

            <div
                data-checked={checked}
                className={cn(
                    "flex w-full h-full items-center justify-center text-white"
                )}
            >
                {indeterminate ? (
                    <i className={cn("fa-solid text-[9px] fa-dash")} />
                ) : (
                    checked && (
                        <i className={cn("fa-solid text-[9px] fa-check")} />
                    )
                )}
            </div>
        </label>
    );
}
