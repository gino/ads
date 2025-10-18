import { cn } from "@/lib/cn";
import { useDebounce } from "@/lib/hooks/use-debounce";
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
import { DateRange, DayPicker as ReactDayPicker } from "react-day-picker";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "../ui/button";
import { DatePickerComponents, getDatePickerClasses } from "../ui/date-picker";
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

    const classNames = getDatePickerClasses();

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
            formatted = `${format(selectedDate.from, formatStr)} — ${format(
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

    // Debounced apply for hotkeys to prevent excessive backend calls
    const debouncedApply = useDebounce(apply, 500);

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
            debouncedApply(nextRange);
        },
        [selectedDate, debouncedApply]
    );

    // Hotkeys
    useHotkeys(
        ["meta+right", "ctrl+right"],
        (e) => {
            e.preventDefault();
            moveRange(1);
        },
        { preventDefault: true },
        [moveRange]
    );
    useHotkeys(
        ["meta+left", "ctrl+left"],
        (e) => {
            e.preventDefault();
            moveRange(-1);
        },
        { preventDefault: true },
        [moveRange]
    );
    useHotkeys(
        ["meta+shift+right", "ctrl+shift+right"],
        (e) => {
            e.preventDefault();
            moveRange(7);
        },
        { preventDefault: true },
        [moveRange]
    );
    useHotkeys(
        ["meta+shift+left", "ctrl+shift+left"],
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
                className="bg-gray-50 rounded-2xl shadow-base-popup overflow-hidden"
            >
                <div className="flex w-full">
                    <div className="w-56 max-h-[380px] p-1 scroll-p-1 shrink-0 overflow-y-auto">
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
                                                "cursor-pointer flex items-center w-full gap-3 px-3 py-2.5 text-left rounded-xl font-semibold active:scale-[0.99] transition-transform duration-100 ease-in-out",
                                                isActive
                                                    ? "bg-gray-100 font-semibold"
                                                    : "hover:bg-gray-100 font-semibold"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "h-4 w-4 rounded-full flex items-center relative justify-center",
                                                    isActive
                                                        ? "bg-brand ring-1 ring-brand after:absolute after:-inset-px after:ring-1 after:ring-inset after:ring-black/5 after:rounded-full"
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

                    <div className="flex-1 p-1 pl-0">
                        <div className="h-full w-full flex flex-col gap-4 bg-white p-4 shadow-base rounded-xl">
                            <div className="flex-1">
                                <ReactDayPicker
                                    mode="range"
                                    numberOfMonths={2}
                                    selected={draftDate}
                                    onSelect={setDraftDate}
                                    month={displayMonth}
                                    onMonthChange={setDisplayMonth}
                                    weekStartsOn={1}
                                    required
                                    disabled={{ after: new Date() }}
                                    classNames={classNames}
                                    components={DatePickerComponents}
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    onClick={() => {
                                        handleOpenChange(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        handleOpenChange(false);

                                        if (!draftDate?.from || !draftDate?.to)
                                            return;

                                        setSelectedDate(draftDate);
                                        apply(draftDate);
                                    }}
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Ariakit.Popover>
        </Ariakit.PopoverProvider>
    );
}
