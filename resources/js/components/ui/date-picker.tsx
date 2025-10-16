import { cn } from "@/lib/cn";
import { getDefaultClassNames, PropsBase } from "react-day-picker";

export const getDatePickerClasses = (): PropsBase["classNames"] => {
    const defaultClassNames = getDefaultClassNames();

    return {
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
            "flex gap-4 flex-col md:flex-row relative",
            defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
            "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
            defaultClassNames.nav
        ),
        month_caption: cn(
            "flex items-center justify-center font-semibold h-6 w-full",
            defaultClassNames.month_caption
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
            "rounded-lg flex-1 select-none font-semibold text-gray-500 text-[12px]",
            defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
            "select-none",
            defaultClassNames.week_number_header
        ),
        week_number: cn("select-none", defaultClassNames.week_number),
        day: cn(
            "relative p-0 text-center group/day aspect-square flex items-center font-medium justify-center select-none h-8 w-8 [&>button]:cursor-pointer text-xs hover:not-data-[selected=true]:bg-gray-100 hover:not-data-[selected=true]:rounded-lg",
            // "[&:first-child[data-selected=true]_button]:rounded-l-lg [&:last-child[data-selected=true]_button]:rounded-r-lg",
            "[&>button]:w-full [&>button]:h-full",
            defaultClassNames.day
        ),
        range_start: cn(
            "[&>button]:bg-brand [&>button]:text-white [&>button]:rounded-lg [&>button]:font-semibold bg-brand/10 rounded-l-lg",
            "[&>button]:relative [&>button]:after:absolute [&>button]:after:ring-1 [&>button]:after:inset-0 [&>button]:after:ring-black/5 [&>button]:after:ring-inset [&>button]:after:rounded-[inherit]",
            defaultClassNames.range_start
        ),
        selected: cn(
            "[&>button]:bg-brand [&>button]:text-white [&>button]:rounded-lg [&>button]:font-semibold bg-brand/10 rounded-lg",
            "[&>button]:relative [&>button]:after:absolute [&>button]:after:ring-1 [&>button]:after:inset-0 [&>button]:after:ring-black/5 [&>button]:after:ring-inset [&>button]:after:rounded-[inherit]",
            defaultClassNames.selected
        ),
        range_middle: cn(
            "bg-brand/10",
            "[&:first-child:not(:empty)]:rounded-l-lg [&:last-child:not(:empty)]:rounded-r-lg",
            defaultClassNames.range_middle
        ),
        range_end: cn(
            "[&>button]:bg-brand [&>button]:text-white [&>button]:rounded-lg [&>button]:font-semibold not-first:bg-brand/10 rounded-r-lg",
            "[&>button]:relative [&>button]:after:absolute [&>button]:after:ring-1 [&>button]:after:inset-0 [&>button]:after:ring-black/5 [&>button]:after:ring-inset [&>button]:after:rounded-[inherit]",
            defaultClassNames.range_end
        ),
        today: cn(
            "not-data-[selected=true]:text-brand not-data-[selected=true]:rounded-lg font-semibold",
            defaultClassNames.today
        ),
        outside: cn(
            "aria-selected:text-muted-foreground",
            defaultClassNames.outside
        ),
        disabled: cn(
            "text-gray-400 [&>button]:!cursor-not-allowed",
            defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
    };
};

export const DatePickerComponents: PropsBase["components"] = {
    PreviousMonthButton: ({ className, ...props }) => (
        <button
            {...props}
            className={cn(
                className,
                "bg-white rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out text-[11px] shadow-base flex items-center justify-center h-6 w-6"
            )}
        >
            <i className="fa-solid fa-angle-left" />
        </button>
    ),
    NextMonthButton: ({ className, ...props }) => (
        <button
            {...props}
            className={cn(
                className,
                "bg-white rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out text-[11px] shadow-base flex items-center justify-center h-6 w-6"
            )}
        >
            <i className="fa-solid fa-angle-right" />
        </button>
    ),
};
