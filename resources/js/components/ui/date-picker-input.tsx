import * as Ariakit from "@ariakit/react";
import { format, isValid, parse, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { DayPicker as ReactDayPicker } from "react-day-picker";
import { DatePickerComponents, getDatePickerClasses } from "./date-picker";
import { Input } from "./input";

const formatString = "dd/MM/yyyy";

interface Props {
    value: Date | null;
    onChange: (value: Date | null) => void;
    utcOffset: number;
}

export function DatePickerInput({ value, onChange, utcOffset }: Props) {
    const [open, setOpen] = useState(false);

    const classNames = getDatePickerClasses();

    // Compute shift (in minutes) so that local browser Date methods render in the ad account timezone
    const browserOffsetMinutes = -new Date().getTimezoneOffset();
    const accountOffsetMinutes =
        utcOffset != null ? Math.round(utcOffset * 60) : undefined;
    const shiftMinutes =
        accountOffsetMinutes != null
            ? accountOffsetMinutes - browserOffsetMinutes
            : 0;

    const toDisplayDate = (date: Date | null): Date | null => {
        if (!date) return null;
        return new Date(date.getTime() + shiftMinutes * 60_000);
    };

    const fromDisplayDate = (date: Date | null): Date | null => {
        if (!date) return null;
        return new Date(date.getTime() - shiftMinutes * 60_000);
    };

    const displayValue = toDisplayDate(value);
    const displayNowStartOfDay = startOfDay(
        new Date(Date.now() + shiftMinutes * 60_000)
    );

    const [month, setMonth] = useState(displayValue ?? new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        displayValue ?? undefined
    );
    const [inputValue, setInputValue] = useState(
        displayValue && isValid(displayValue)
            ? format(displayValue, formatString)
            : ""
    );

    useEffect(() => {
        const nextDisplay = toDisplayDate(value);
        if (nextDisplay && isValid(nextDisplay)) {
            setSelectedDate(nextDisplay);
            setMonth(nextDisplay);
            setInputValue(format(nextDisplay, formatString));
        } else {
            setSelectedDate(undefined);
            setInputValue("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, utcOffset]);

    return (
        <Ariakit.PopoverProvider
            open={open}
            setOpen={setOpen}
            placement="bottom-start"
        >
            <Ariakit.PopoverDisclosure
                toggleOnClick={false}
                render={(props) => (
                    <div className="relative">
                        <Input
                            onFocus={() => {
                                setOpen(true);
                            }}
                            onChange={(e) => {
                                setInputValue(e.target.value);

                                const parsedDate = parse(
                                    e.target.value,
                                    formatString,
                                    new Date()
                                );

                                if (isValid(parsedDate)) {
                                    // interpret parsed local date as account timezone date
                                    setSelectedDate(parsedDate);
                                    setMonth(parsedDate);
                                    onChange(fromDisplayDate(parsedDate));
                                } else {
                                    setSelectedDate(undefined);
                                    onChange(null);
                                }
                            }}
                            value={inputValue}
                            placeholder={formatString.toLowerCase()}
                            className="pl-10"
                            {...props}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none">
                            <i className="fa-regular fa-calendar text-xs text-gray-400" />
                        </div>
                    </div>
                )}
            />
            <Ariakit.Popover
                slide={false}
                portal
                autoFocusOnShow={false}
                autoFocusOnHide={false}
                gutter={8}
                className="bg-white p-4 rounded-2xl shadow-base-popup overflow-hidden"
            >
                <ReactDayPicker
                    mode="single"
                    onSelect={(date) => {
                        if (!date) {
                            setInputValue("");
                            setSelectedDate(undefined);
                            onChange(null);
                        } else {
                            setSelectedDate(date);
                            setMonth(date);
                            setInputValue(format(date, formatString));
                            onChange(fromDisplayDate(date));
                        }
                        setOpen(false);
                    }}
                    weekStartsOn={1}
                    month={month}
                    selected={selectedDate}
                    onMonthChange={setMonth}
                    classNames={classNames}
                    components={DatePickerComponents}
                    disabled={{ before: displayNowStartOfDay }}
                />
            </Ariakit.Popover>
        </Ariakit.PopoverProvider>
    );
}
