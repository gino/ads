import { formatDistanceToNowStrict } from "date-fns";
import { Select } from "../ui/select";

interface Props {
    label?: string;
    value: string;
    onChange: (pixelId: string) => void;
    isLoading: boolean;
    pixels: App.Data.PixelData[];
}

export function PixelInput({
    label = "Pixel",
    value,
    onChange,
    isLoading,
    pixels,
}: Props) {
    return (
        <Select
            label={label}
            placeholder="Select a pixel"
            value={value}
            onChange={onChange}
            isLoading={isLoading}
            items={pixels}
            getItem={(pixel) => ({
                value: pixel.id,
                label: (
                    <div className="flex flex-1 gap-3 items-center mr-1 text-left truncate">
                        <div className="flex-1 truncate">
                            <div className="font-semibold truncate">
                                {pixel.name}
                            </div>
                        </div>

                        <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-hover:bg-gray-200 group-data-[selected='true']:bg-black/5 group-data-[active-item]:bg-gray-200">
                            Last active:{" "}
                            {formatDistanceToNowStrict(
                                new Date(pixel.lastFiredTime),
                                {
                                    addSuffix: true,
                                }
                            )}
                        </div>
                    </div>
                ),
            })}
        />
    );
}
