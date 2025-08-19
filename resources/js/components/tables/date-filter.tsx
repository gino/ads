import { cn } from "@/lib/cn";
import * as Ariakit from "@ariakit/react";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { useMemo, useState } from "react";
import {
    DateRange,
    getDefaultClassNames,
    OnSelectHandler,
    DayPicker as ReactDayPicker,
} from "react-day-picker";

const presets = {
    Today: "",
    Yesterday: "",
    "Today and yesterday": "",
    "Past 7 days": "",
    "Past 14 days": "",
    "Past 28 days": "",
    "Past 30 days": "",
    "This week": "",
    "Past week": "",
    "This month": "",
    "Past month": "",
    Maximum: "",
};

export function DateFilter() {
    const [open, setOpen] = useState(false);

    const today = new Date();

    const [selectedDate, setSelectedDate] = useState<DateRange>({
        from: today,
        to: today,
    });
    const [draftDate, setDraftDate] = useState<DateRange>(selectedDate);

    const label = useMemo(() => {
        const formatStr = "d MMM yyyy";

        if (!selectedDate || !selectedDate.from) return "nope";

        if (!selectedDate.to || isSameDay(selectedDate.from, selectedDate.to)) {
            if (isToday(selectedDate.from)) {
                return `Today: ${format(selectedDate.from, formatStr)}`;
            }

            if (isYesterday(selectedDate.from)) {
                return `Yesterday: ${format(selectedDate.from, formatStr)}`;
            }

            return format(selectedDate.from, formatStr);
        }

        return `${format(selectedDate.from, formatStr)} - ${format(
            selectedDate.to,
            formatStr
        )}`;
    }, [selectedDate]);

    return (
        <Ariakit.PopoverProvider
            open={open}
            setOpen={setOpen}
            placement="bottom-end"
        >
            <Ariakit.PopoverDisclosure className="bg-white text-xs shadow-base pl-3 pr-3.5 shrink-0 py-2.5 flex items-center gap-2 rounded-lg active:scale-[0.99] transition-transform duration-100 ease-in-out cursor-pointer">
                <i className="fa-regular fa-calendar text-xs text-gray-400" />
                <span className="font-semibold flex-1 text-left">
                    {/* Today: 18 Aug 2025 */}
                    {label}
                </span>

                <i className="fa-solid fa-chevron-down text-gray-400 text-[12px] ml-4" />
            </Ariakit.PopoverDisclosure>

            <Ariakit.Popover
                slide={false}
                wrapperProps={{
                    // For some reason this is needed to be above our sticky table header
                    className: "!z-50",
                }}
                portal
                // preventBodyScroll
                gutter={8}
                className="bg-gray-50 rounded-xl shadow-base-popup overflow-hidden"
            >
                <div className="flex w-full">
                    <div className="w-56 max-h-[380px] scroll-p-1.5 overflow-y-auto">
                        <div className="p-1.5 space-y-1.5">
                            {Object.entries(presets).map(([preset]) => (
                                <button
                                    key={preset}
                                    className="hover:bg-gray-100 cursor-pointer flex items-center w-full gap-3 px-3 py-2.5 text-left rounded-lg font-medium text-xs"
                                >
                                    <div className="h-4 w-4 bg-white shadow-base rounded-full" />
                                    <span>{preset}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 bg-white p-4 shadow-base rounded-l-xl">
                        <div className="flex-1">
                            <DatePicker
                                selected={draftDate}
                                setSelected={setDraftDate}
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                }}
                                className="font-semibold shadow-base px-3.5 py-2 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    if (draftDate) {
                                        setSelectedDate(draftDate);
                                    }
                                }}
                                className="font-semibold cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out text-white ring-1 bg-brand ring-brand px-3.5 py-2 rounded-md"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            </Ariakit.Popover>
        </Ariakit.PopoverProvider>
    );
}

function DatePicker(props: {
    selected: DateRange | undefined;
    setSelected: OnSelectHandler<DateRange>;
}) {
    const defaultClassNames = getDefaultClassNames();

    return (
        <ReactDayPicker
            mode="range"
            numberOfMonths={2}
            selected={props.selected}
            onSelect={props.setSelected}
            weekStartsOn={1}
            required
            disabled={{ after: new Date() }}
            classNames={{
                root: cn("w-fit", defaultClassNames.root),
                months: cn(
                    "flex gap-4 flex-col md:flex-row relative",
                    defaultClassNames.months
                ),
                month: cn(
                    "flex flex-col w-full gap-4",
                    defaultClassNames.month
                ),
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
                    "relative p-0 text-center group/day aspect-square flex items-center justify-center select-none h-8 w-8 font-medium [&>button]:cursor-pointer text-xs",
                    // "[&:first-child[data-selected=true]_button]:rounded-l-lg [&:last-child[data-selected=true]_button]:rounded-r-lg",
                    "[&>button]:w-full [&>button]:h-full",
                    defaultClassNames.day
                ),
                range_start: cn(
                    "[&>button]:bg-brand [&>button]:text-white [&>button]:rounded-lg [&>button]:font-semibold bg-brand/10 rounded-l-lg",
                    defaultClassNames.range_start
                ),
                range_middle: cn(
                    "bg-brand/10",
                    "[&:first-child:not(:empty)]:rounded-l-lg [&:last-child:not(:empty)]:rounded-r-lg",
                    defaultClassNames.range_middle
                ),
                range_end: cn(
                    "[&>button]:bg-brand [&>button]:text-white [&>button]:rounded-lg [&>button]:font-semibold not-first:bg-brand/10 rounded-r-lg",
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
            }}
            components={{
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
            }}
        />
    );
}
