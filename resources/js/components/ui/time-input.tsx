import { isValid } from "date-fns";
import { Input } from "./input";

interface Props {
    value: Date | null;
    onChange: (date: Date) => void;
    // utc offset in hours for the ad account timezone (e.g., +2, -5)
    utcOffset?: number;
}

export function TimeInput({ value, onChange, utcOffset }: Props) {
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

    const fromDisplayDate = (date: Date): Date => {
        return new Date(date.getTime() - shiftMinutes * 60_000);
    };

    const formatTime = (date: Date | null) => {
        const display = toDisplayDate(date);
        if (!display) return ""; // show empty input if null
        const hours = display.getHours().toString().padStart(2, "0");
        const minutes = display.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(":").map(Number);
        // If value is null, start from today in display timezone
        const baseDisplayDate = toDisplayDate(value) ?? new Date();
        const nextDisplayDate = new Date(baseDisplayDate);
        nextDisplayDate.setHours(hours, minutes, 0, 0);
        const newDate = fromDisplayDate(nextDisplayDate);

        if (isValid(newDate)) {
            onChange(newDate);
        }
    };

    return (
        <div className="relative">
            <Input
                type="time"
                value={formatTime(value)}
                onChange={handleChange}
                className="pl-10 pr-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            <div className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none">
                <i className="fa-regular fa-clock text-xs text-gray-400" />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none">
                <span>TODO</span>
            </div>
        </div>
    );
}
