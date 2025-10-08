import { cn } from "@/lib/cn";
import { cva, VariantProps } from "class-variance-authority";
import { ComponentProps, ReactNode } from "react";

const button = cva(
    "font-semibold px-3.5 py-2 rounded-md cursor-pointer enabled:active:scale-[0.99] disabled:cursor-not-allowed transition-transform duration-100 ease-in-out disabled:opacity-50 flex items-center justify-center gap-2 text-center",
    {
        variants: {
            variant: {
                secondary:
                    "bg-white shadow-base hover:bg-gray-50 enabled:active:bg-white",
                primary:
                    "text-white ring-1 bg-brand-secondary ring-brand-secondary hover:opacity-90 enabled:active:opacity-100",
            },
        },
        defaultVariants: {
            variant: "secondary",
        },
    }
);

interface Props extends VariantProps<typeof button>, ComponentProps<"button"> {
    disabled?: boolean;
    loading?: boolean;
    loadingText?: ReactNode;
    icon?: string;
}

export function Button({
    children,
    variant,
    disabled,
    type = "button",
    icon,
    loading,
    loadingText,
    className,
    ...props
}: Props) {
    const classes = button({ variant, className });

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={cn(classes)}
            {...props}
        >
            {loading ? (
                <i className="fa-solid -ml-0.5 fa-spinner-third animate-spin text-[12px]" />
            ) : (
                icon && <i className={cn(icon, "-ml-0.5")} />
            )}
            <span>{loading && loadingText ? loadingText : children}</span>
        </button>
    );
}
