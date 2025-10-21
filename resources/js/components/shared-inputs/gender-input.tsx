import { Radio } from "../ui/radio";

interface Props {
    label?: string;
    value: string;
    onChange: (value: string) => void;
}

export function GenderInput({ label = "Gender", value, onChange }: Props) {
    return (
        <div>
            <div className="mb-2 font-semibold">{label}</div>

            <Radio
                value={value}
                onChange={(value) => onChange(value)}
                options={[
                    {
                        label: "All",
                        value: "all",
                    },
                    {
                        label: "Men",
                        value: "men",
                    },
                    {
                        label: "Women",
                        value: "women",
                    },
                ]}
            />
        </div>
    );
}
