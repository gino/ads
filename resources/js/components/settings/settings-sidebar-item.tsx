import { cn } from "@/lib/cn";
import { Route, SharedData } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { ReactElement, useMemo } from "react";

interface Props {
    children: string;
    href?: Route;
    suffix?: ReactElement;
}

export function SidebarItem({ children, href, suffix }: Props) {
    const page = usePage<SharedData>();

    const active = useMemo(() => {
        if (!href) return false;

        const ziggyRoute = page.props.ziggy.route;
        return ziggyRoute === href || ziggyRoute?.startsWith(href);
    }, [href]);

    return (
        <Link
            href={href ? route(href) : page.props.ziggy.location}
            className={cn(
                "font-semibold text-left active:scale-[0.99] transition-transform duration-100 ease-in-out w-full flex rounded-lg px-3.5 py-2.5 ring-1 text-sm cursor-pointer items-center gap-3 group",
                active
                    ? "bg-gray-100 ring-gray-100"
                    : "hover:bg-gray-100 hover:ring-gray-100 ring-transparent"
            )}
        >
            <span className="flex-1">{children}</span>
            {suffix}
        </Link>
    );
}
