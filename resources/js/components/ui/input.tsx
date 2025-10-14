import { cn } from "@/lib/cn";
import { ComponentProps } from "react";

interface Props extends ComponentProps<"input"> {
    //
}

export function Input({ className, ...props }: Props) {
    return (
        <input
            className={cn(
                "w-full px-3.5 py-2.5 bg-white rounded-lg ring-1 ring-gray-200 placeholder-gray-400 font-semibold focus:ring-2 outline-none focus:ring-offset-1 focus:ring-offset-black/5 focus:ring-blue-100 transition duration-150 ease-in-out",
                className
            )}
            {...props}
        />
    );
}
