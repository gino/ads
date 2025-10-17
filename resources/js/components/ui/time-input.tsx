import { isValid } from "date-fns";
import { Input } from "./input";

interface Props {
    value: Date | null;
    onChange: (date: Date) => void;
}

export function TimeInput({ value, onChange }: Props) {
    const formatTime = (date: Date | null) => {
        if (!date) return ""; // show empty input if null
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(":").map(Number);
        // If value is null, start from today
        const newDate = value ? new Date(value) : new Date();
        newDate.setHours(hours, minutes, 0, 0);

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
                className="pl-10 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
            <div className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none">
                <i className="fa-regular fa-clock text-xs text-gray-400" />
            </div>
        </div>
    );
}
