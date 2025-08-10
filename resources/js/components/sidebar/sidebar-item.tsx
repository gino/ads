import { cn } from "@/lib/cn";
import { SharedData } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { ComponentProps, ReactElement, useMemo } from "react";

interface BaseProps {
    icon: string;
    children: string;
    suffix?: ReactElement;
    disabled?: boolean;
    className?: string;
}

interface AsButton
    extends BaseProps,
        Omit<ComponentProps<"button">, keyof BaseProps> {
    onClick: ComponentProps<"button">["onClick"];
    href?: never;
}

interface AsLink
    extends BaseProps,
        Omit<ComponentProps<typeof Link>, keyof BaseProps | "disabled"> {
    href: Parameters<typeof route>[0];
    onClick?: never;
}

type Props = AsButton | AsLink;

export function SidebarItem({
    icon,
    children,
    suffix,
    disabled = false,
    className,
    ...props
}: Props) {
    const page = usePage<SharedData>();

    const isLink = "href" in props && props.href;

    const active = useMemo(() => {
        if (isLink) {
            return page.props.ziggy.route === props.href;
        }

        return false;
    }, [props, isLink]);

    const classes = cn(
        "px-3 enabled:cursor-pointer py-2.5 flex rounded-lg group w-full items-center gap-3 font-semibold ring-gray-100 transition-transform duration-100 ease-in-out",
        isLink ? "active:scale-[0.99]" : "enabled:active:scale-[0.99]",
        isLink
            ? "aria-[disabled='true']:cursor-not-allowed aria-[disabled='true']:opacity-60"
            : "disabled:cursor-not-allowed disabled:opacity-60",
        active
            ? "bg-gray-100 ring-1"
            : isLink
            ? "hover:bg-gray-100 hover:ring-1"
            : "enabled:hover:bg-gray-100 enabled:hover:ring-1",
        className
    );

    const contents = (
        <>
            <i
                className={cn(
                    "text-base fa-regular fa-fw",
                    icon,
                    !active && "text-gray-400",
                    !active &&
                        (isLink
                            ? "group-hover:text-black"
                            : "group-enabled:group-hover:text-black")
                )}
            />
            <span
                className={cn(
                    "flex-1 text-left truncate",
                    !active && "text-gray-600",
                    !active &&
                        (isLink
                            ? "group-hover:text-black"
                            : "group-enabled:group-hover:text-black")
                )}
            >
                {children}
            </span>
            {suffix}
        </>
    );

    // Render as button if onClick is provided
    if ("onClick" in props && props.onClick) {
        return (
            <button
                title={children}
                className={classes}
                disabled={disabled}
                {...props}
            >
                {contents}
            </button>
        );
    }

    // Render as Link if href is provided
    if (isLink) {
        const linkProps = { ...props } as Omit<
            ComponentProps<typeof Link>,
            "disabled"
        >;

        return (
            <Link
                title={children}
                className={classes}
                {...linkProps}
                href={disabled ? page.props.ziggy.location : route(props.href)}
                onClick={
                    disabled ? (e) => e.preventDefault() : linkProps.onClick
                }
                tabIndex={disabled ? -1 : undefined}
                aria-disabled={disabled}
            >
                {contents}
            </Link>
        );
    }

    // Fallback to button (shouldn't happen with proper typing)
    return (
        <button
            title={children}
            className={classes}
            disabled={disabled}
            type="button"
        >
            {contents}
        </button>
    );
}
