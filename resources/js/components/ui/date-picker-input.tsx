import * as Ariakit from "@ariakit/react";
import { format, isValid, parse } from "date-fns";
import { useEffect, useState } from "react";
import { DayPicker as ReactDayPicker } from "react-day-picker";
import { DatePickerComponents, getDatePickerClasses } from "./date-picker";
import { Input } from "./input";

const formatString = "dd/MM/yyyy";

interface Props {
    value: Date | null;
    onChange: (value: Date | null) => void;
}

export function DatePickerInput({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);

    const classNames = getDatePickerClasses();

    const [month, setMonth] = useState(value ?? new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        value ?? undefined
    );
    const [inputValue, setInputValue] = useState(
        value && isValid(value) ? format(value, formatString) : ""
    );

    useEffect(() => {
        if (value && isValid(value)) {
            setSelectedDate(value);
            setMonth(value);
            setInputValue(format(value, formatString));
        } else {
            setSelectedDate(undefined);
            setInputValue("");
        }
    }, [value]);

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
                                    setSelectedDate(parsedDate);
                                    setMonth(parsedDate);
                                    onChange(parsedDate);
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
                            onChange(date);
                        }
                        setOpen(false);
                    }}
                    weekStartsOn={1}
                    month={month}
                    selected={selectedDate}
                    onMonthChange={setMonth}
                    classNames={classNames}
                    components={DatePickerComponents}
                    disabled={{ before: new Date() }}
                />
            </Ariakit.Popover>
        </Ariakit.PopoverProvider>
    );
}
