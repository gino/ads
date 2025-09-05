import { cn } from "@/lib/cn";
import { Route, SharedData } from "@/types";
import * as Ariakit from "@ariakit/react";
import { router, usePage } from "@inertiajs/react";
import {
    addDays,
    differenceInCalendarDays,
    endOfMonth,
    endOfToday,
    endOfWeek,
    format,
    isSameDay,
    isToday,
    isValid,
    isYesterday,
    min,
    parse,
    startOfDay,
    startOfMonth,
    startOfWeek,
    subDays,
    subMonths,
} from "date-fns";
import { useCallback, useMemo, useState } from "react";
import {
    DateRange,
    getDefaultClassNames,
    OnSelectHandler,
    DayPicker as ReactDayPicker,
} from "react-day-picker";
import { useHotkeys } from "react-hotkeys-hook";
import { isRangeEqual } from "./utils";

const presets = {
    Today: (today: Date) => ({
        from: startOfDay(today),
        to: endOfToday(),
    }),

    Yesterday: (today: Date) => ({
        from: subDays(startOfDay(today), 1),
        to: subDays(endOfToday(), 1),
    }),

    "Today and yesterday": (today: Date) => ({
        from: subDays(startOfDay(today), 1),
        to: endOfToday(),
    }),

    "Past 7 days": (today: Date) => ({
        from: subDays(startOfDay(today), 6),
        to: endOfToday(),
    }),

    "Past 14 days": (today: Date) => ({
        from: subDays(startOfDay(today), 13),
        to: endOfToday(),
    }),

    "Past 28 days": (today: Date) => ({
        from: subDays(startOfDay(today), 27),
        to: endOfToday(),
    }),

    "Past 30 days": (today: Date) => ({
        from: subDays(startOfDay(today), 29),
        to: endOfToday(),
    }),

    "This week": (today: Date) => ({
        from: startOfWeek(today, { weekStartsOn: 1 }),
        to: min([endOfWeek(today, { weekStartsOn: 1 }), endOfToday()]),
    }),

    "Past week": (today: Date) => ({
        from: startOfWeek(subDays(today, 7), { weekStartsOn: 1 }),
        to: min([
            endOfWeek(subDays(today, 7), { weekStartsOn: 1 }),
            endOfToday(),
        ]),
    }),

    "This month": (today: Date) => ({
        from: startOfMonth(today),
        to: min([endOfMonth(today), endOfToday()]),
    }),

    "Past month": (today: Date) => {
        const pastMonth = subDays(today, 30);
        return {
            from: startOfMonth(pastMonth),
            to: min([endOfMonth(pastMonth), endOfToday()]),
        };
    },

    Maximum: (today: Date) => ({
        from: subMonths(startOfDay(today), 37), // 37 months is the maximum for Meta API
        to: endOfToday(), // up to today
    }),
};

export function DateFilter() {
    const {
        props: { ziggy },
    } = usePage<SharedData>();
    const [open, setOpen] = useState(false);
    const [displayMonth, setDisplayMonth] = useState<Date | undefined>(
        undefined
    );

    const today = new Date();

    const parseQueryDate = (value: unknown): Date | undefined => {
        if (typeof value !== "string" || value.trim() === "") return undefined;
        const d = parse(value, "yyyy-MM-dd", new Date());
        return isValid(d) ? d : undefined;
    };

    const initialFrom = parseQueryDate(ziggy?.query?.from) ?? today;
    const initialTo = parseQueryDate(ziggy?.query?.to) ?? today;

    const [selectedDate, setSelectedDate] = useState<DateRange>({
        from: initialFrom,
        to: initialTo,
    });

    const [draftDate, setDraftDate] = useState<DateRange | undefined>(
        selectedDate
    );

    const handleOpenChange = useCallback(
        (next: boolean) => {
            setOpen(next);
            if (next) {
                const focusDate =
                    draftDate?.to ??
                    draftDate?.from ??
                    selectedDate?.to ??
                    selectedDate?.from ??
                    today;
                if (focusDate) setDisplayMonth(focusDate);
            }
        },
        [draftDate, selectedDate, today]
    );

    const activePresetName = useMemo(() => {
        if (!selectedDate?.from || !selectedDate?.to) return undefined;

        for (const [preset, getRange] of Object.entries(presets)) {
            const range = getRange(today);
            if (isRangeEqual(selectedDate, range)) return preset;
        }

        return undefined;
    }, [selectedDate, today]);

    const label = useMemo(() => {
        const formatStr = "MMMM d, yyyy";

        if (!selectedDate || !selectedDate.from) return "nope";

        const isSingleDay =
            !selectedDate.to || isSameDay(selectedDate.from, selectedDate.to);

        let formatted: string;
        if (isSingleDay) {
            formatted = format(selectedDate.from, formatStr);
        } else {
            // At this point, selectedDate.to is defined
            formatted = `${format(selectedDate.from, formatStr)} - ${format(
                selectedDate.to as Date,
                formatStr
            )}`;
        }

        // if (activePresetName) {
        //     return `${activePresetName}: ${formatted}`;
        //     // return `${formatted}`;
        // }

        if (isSingleDay) {
            if (isToday(selectedDate.from)) {
                return `Today: ${formatted}`;
            }

            if (isYesterday(selectedDate.from)) {
                return `Yesterday: ${formatted}`;
            }
        }

        return formatted;
    }, [selectedDate, activePresetName]);

    const apply = (range: DateRange | undefined) => {
        const propsToRefresh = {
            "dashboard.campaigns": ["campaigns"],
            "dashboard.campaigns.adSets": ["adSets"],
            "dashboard.campaigns.ads": ["ads"],
        } satisfies Partial<Record<Route, string[]>>;

        if (!range?.from || !range?.to) return;

        router.get(
            route(route().current()!),
            {
                ...route().params,
                from: format(range.from, "yyyy-MM-dd"),
                to: format(range.to, "yyyy-MM-dd"),
            },
            {
                only: [
                    ...propsToRefresh[
                        route().current() as keyof typeof propsToRefresh
                    ],
                    "cacheKey",
                ],
                preserveState: true,
                replace: true,
            }
        );
    };

    // Shift current range by deltaDays while preventing going into the future
    const moveRange = useCallback(
        (deltaDays: number) => {
            const current = selectedDate;
            if (!current?.from && !current?.to) return;

            const from = current?.from ?? current?.to ?? today;
            const to = current?.to ?? current?.from ?? today;

            let newFrom = addDays(from, deltaDays);
            let newTo = addDays(to, deltaDays);

            const todayEnd = endOfToday();
            if (newTo > todayEnd) {
                const overflow = differenceInCalendarDays(newTo, todayEnd);
                newFrom = addDays(newFrom, -overflow);
                newTo = addDays(newTo, -overflow);
            }

            // Disallow moving into the future when the range length is 0 and delta > 0 from today
            if (newTo > todayEnd) {
                newTo = todayEnd;
            }

            const nextRange: DateRange = { from: newFrom, to: newTo };
            setSelectedDate(nextRange);
            setDraftDate(nextRange);
            apply(nextRange);
        },
        [selectedDate]
    );

    // Hotkeys
    useHotkeys(
        "meta+right",
        (e) => {
            e.preventDefault();
            moveRange(1);
        },
        { preventDefault: true },
        [moveRange]
    );
    useHotkeys(
        "meta+left",
        (e) => {
            e.preventDefault();
            moveRange(-1);
        },
        { preventDefault: true },
        [moveRange]
    );
    useHotkeys(
        "meta+shift+right",
        (e) => {
            e.preventDefault();
            moveRange(7);
        },
        { preventDefault: true },
        [moveRange]
    );
    useHotkeys(
        "meta+shift+left",
        (e) => {
            e.preventDefault();
            moveRange(-7);
        },
        { preventDefault: true },
        [moveRange]
    );

    return (
        <Ariakit.PopoverProvider
            open={open}
            setOpen={handleOpenChange}
            placement="bottom-end"
        >
            <Ariakit.PopoverDisclosure className="bg-white text-xs shadow-base pl-3 pr-3.5 shrink-0 py-2.5 flex items-center rounded-lg active:scale-[0.99] transition-transform duration-100 ease-in-out cursor-pointer">
                <i className="fa-regular fa-calendar text-xs text-gray-400 mr-2" />
                <span className="font-semibold flex-1 text-left whitespace-nowrap">
                    {/* Today: 18 Aug 2025 */}
                    {label}
                </span>

                <i
                    className={cn(
                        "fa-solid fa-angle-down text-gray-400 text-xs ml-3 transition-transform duration-200 ease-in-out",
                        open && "rotate-180"
                    )}
                />
            </Ariakit.PopoverDisclosure>

            <Ariakit.Popover
                slide={false}
                wrapperProps={{
                    // For some reason this is needed to be above our sticky table header
                    className: "!z-50",
                }}
                portal
                gutter={8}
                className="bg-gray-50 rounded-xl shadow-base-popup overflow-hidden"
            >
                <div className="flex w-full">
                    <div className="w-56 max-h-[380px] p-1.5 scroll-p-1.5 overflow-y-auto">
                        <div className="space-y-1.5">
                            {Object.entries(presets).map(
                                ([preset, getRange]) => {
                                    const range = getRange(today);

                                    const isActive = draftDate
                                        ? isRangeEqual(draftDate, range)
                                        : isRangeEqual(selectedDate, range);

                                    return (
                                        <button
                                            key={preset}
                                            onClick={() => {
                                                setDraftDate(range);
                                                setSelectedDate(range);
                                                handleOpenChange(false);
                                                apply(range);
                                            }}
                                            className={cn(
                                                "cursor-pointer flex items-center w-full gap-3 px-3 py-2.5 text-left rounded-lg font-semibold active:scale-[0.99] transition-transform duration-100 ease-in-out",
                                                isActive
                                                    ? "bg-gray-100 font-semibold"
                                                    : "hover:bg-gray-100 font-semibold"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "h-4 w-4 rounded-full flex items-center justify-center",
                                                    isActive
                                                        ? "bg-brand ring-1 ring-brand"
                                                        : "bg-white shadow-base"
                                                )}
                                            >
                                                {isActive && (
                                                    <div className="h-[7px] w-[7px] bg-white rounded-full" />
                                                )}
                                            </div>
                                            <span>{preset}</span>
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 bg-white p-4 shadow-base rounded-l-xl">
                        <div className="flex-1">
                            <DatePicker
                                selected={draftDate}
                                setSelected={setDraftDate}
                                month={displayMonth}
                                onMonthChange={setDisplayMonth}
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => {
                                    handleOpenChange(false);
                                }}
                                className="font-semibold shadow-base px-3.5 py-2 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleOpenChange(false);

                                    if (!draftDate?.from || !draftDate?.to)
                                        return;

                                    setSelectedDate(draftDate);
                                    apply(draftDate);
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
    month?: Date;
    onMonthChange?: (month: Date) => void;
}) {
    const defaultClassNames = getDefaultClassNames();

    return (
        <ReactDayPicker
            mode="range"
            numberOfMonths={2}
            selected={props.selected}
            onSelect={props.setSelected}
            month={props.month}
            onMonthChange={props.onMonthChange}
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
                    "relative p-0 text-center group/day aspect-square flex items-center font-medium justify-center select-none h-8 w-8 [&>button]:cursor-pointer text-xs hover:not-data-[selected=true]:bg-gray-100 hover:not-data-[selected=true]:rounded-lg",
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
