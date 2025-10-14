import { cn } from "@/lib/cn";
import { ComponentProps } from "react";

interface Props extends ComponentProps<"textarea"> {
    //
}

export function Textarea({ className, ...props }: Props) {
    return (
        <textarea
            className={cn(
                "ring-1 ring-gray-200 resize-none rounded-lg bg-white px-3.5 py-2.5 w-full scroll-py-2.5 scroll-px-3.5 min-h-24 field-sizing-content placeholder-gray-400 font-semibold placeholder-shown:font-semibold focus:ring-2 outline-none focus:ring-offset-1 focus:ring-offset-black/5 focus:ring-blue-100 transition duration-150 ease-in-out",
                className
            )}
            {...props}
        />
    );
}
