import { useMemo } from "react";
import { MultiCombobox } from "../ui/multi-combobox";

interface Props {
    label?: string;
    isLoading: boolean;
    countries: App.Data.TargetingCountryData[];
    value: string[];
    onChange: (values: string[]) => void;
}

export function LocationsInput({
    label = "Targeting locations",
    isLoading,
    countries,
    value,
    onChange,
}: Props) {
    const normalizedCountries = useMemo(() => {
        if (isLoading) return [];
        return countries.map((country) => ({
            label: (
                <div className="flex flex-1 gap-3 items-center mr-1 text-left truncate">
                    <div className="flex-1 truncate">
                        <div className="font-semibold truncate">
                            {country.name}
                        </div>
                    </div>
                    <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-hover:bg-gray-200 group-data-[selected='true']:bg-black/5 group-data-[active-item]:bg-gray-200">
                        {country.countryCode}
                    </div>
                </div>
            ),
            rawLabel: country.name,
            value: country.countryCode,
        }));
    }, [countries, isLoading]);

    const namedLocations = useMemo(() => {
        if (!value || isLoading) {
            return [];
        }

        const named = value
            .map((value) => {
                return countries.find((c) => c.countryCode === value)!;
            })
            .filter(Boolean);

        if (!(named.length > 0)) {
            return [];
        }

        return named;
    }, [value, countries, isLoading]);

    return (
        <div>
            <div className="mb-2 font-semibold">{label}</div>

            {namedLocations.length > 0 && (
                <div className="flex items-center flex-wrap mb-3 gap-1.5">
                    {namedLocations.map((location) => (
                        <div
                            key={location.countryCode}
                            className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5"
                        >
                            <div>{location.name}</div>
                            <button
                                onClick={() => {
                                    onChange(
                                        value.filter(
                                            (code) =>
                                                code !== location.countryCode
                                        )
                                    );
                                }}
                                type="button"
                                className="cursor-pointer text-[8px] flex mt-px ml-1 focus-visible:ring"
                            >
                                <i className="fa-solid fa-times" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <MultiCombobox
                placeholder="Search countries..."
                isLoading={isLoading}
                items={normalizedCountries}
                value={value}
                onChange={(values) => onChange(values)}
            />
        </div>
    );
}
