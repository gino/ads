import { cn } from "@/lib/cn";
import { Slider } from "@base-ui-components/react/slider";
import { useMemo } from "react";

interface Props {
    label?: string;
    value: [number, number];
    onChange: (values: [number, number]) => void;
}

export function AgeRangeInput({ label = "Age range", value, onChange }: Props) {
    const minAge = useMemo(() => {
        return value[0];
    }, [value]);

    const maxAge = useMemo(() => {
        const maxAge = value[1];

        if (maxAge === 65) {
            return "65+";
        }

        return maxAge;
    }, [value]);

    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="font-semibold">{label}</div>
                <div className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5">
                    {minAge} - {maxAge}
                </div>
            </div>
            <div>
                <Slider.Root
                    value={value}
                    onValueChange={(values) => {
                        onChange(values);
                    }}
                    min={18}
                    max={65}
                    thumbAlignment="edge"
                >
                    <Slider.Control className="flex w-full touch-none items-center pt-4 pb-2 select-none">
                        <Slider.Track className="h-2 w-full rounded bg-gray-100 ring-1 ring-inset ring-black/5 select-none">
                            <Slider.Indicator className="rounded bg-brand select-none ring-1 ring-inset ring-black/5" />
                            {[0, 1].map((index) => (
                                <Slider.Thumb
                                    key={index}
                                    index={index}
                                    disabled
                                    className="size-5 rounded-full bg-white shadow-base cursor-pointer select-none flex items-center justify-center"
                                >
                                    <div
                                        className={cn(
                                            "h-[8px] w-[8px] bg-brand/10 rounded-full ring-1 ring-inset ring-black/10"
                                        )}
                                    />
                                </Slider.Thumb>
                            ))}
                        </Slider.Track>
                    </Slider.Control>
                </Slider.Root>
            </div>
        </div>
    );
}
