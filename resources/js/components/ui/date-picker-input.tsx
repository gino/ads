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
                            } else {
                                setSelectedDate(undefined);
                            }
                        }}
                        value={inputValue}
                        placeholder={formatString.toLowerCase()}
                        {...props}
                    />
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
                        } else {
                            setSelectedDate(date);
                            setMonth(date);
                            setInputValue(format(date, formatString));
                        }
                        setOpen(false);
                    }}
                    month={month}
                    selected={selectedDate}
                    onMonthChange={setMonth}
                    classNames={classNames}
                    components={DatePickerComponents}
                />
            </Ariakit.Popover>
        </Ariakit.PopoverProvider>
    );
}
