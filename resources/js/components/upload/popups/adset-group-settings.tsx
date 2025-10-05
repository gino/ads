import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import useDeferred from "@/lib/hooks/use-deferred";
import { AdSetGroupSettings } from "@/pages/upload";
import { Slider } from "@base-ui-components/react/slider";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo } from "react";
import { useUploadedCreativesContext } from "../uploaded-creatives";

export function AdSetGroupSettingsPopup() {
    const {
        popupAdSetId,
        setPopupAdSetId,
        getSettings,
        updateSetting,
        adSetGroups,
    } = useUploadedCreativesContext();

    const adSetGroup = useMemo(() => {
        if (!popupAdSetId) return;
        return adSetGroups.find((g) => g.id === popupAdSetId);
    }, [popupAdSetId, adSetGroups]);

    const { props } = usePage<{ countries: App.Data.TargetingCountryData[] }>();

    const { isLoading: isLoadingCountries } = useDeferred({
        data: ["countries"],
    });

    const { locations, age } = getSettings(popupAdSetId!);

    const form = useForm<AdSetGroupSettings>({
        locations,
        age,
    });

    useEffect(() => {
        if (!popupAdSetId) return;
        // Do this for every property inside of `form`
        form.setData("locations", locations);
        form.setData("age", age);
    }, [popupAdSetId, locations, age]);

    const countries = useMemo(() => {
        if (isLoadingCountries) return [];
        return props.countries.map((country) => ({
            label: (
                <div className="flex flex-1 gap-3 items-center mr-1 text-left truncate">
                    <div className="flex-1 truncate">
                        <div className="font-semibold truncate">
                            {country.name}
                        </div>
                    </div>
                    <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[active-item]:bg-gray-200">
                        {country.countryCode}
                    </div>
                </div>
            ),
            rawLabel: country.name,
            value: country.countryCode,
        }));
    }, [props.countries, isLoadingCountries]);

    const namedLocations = useMemo(() => {
        if (!form.data.locations || !popupAdSetId) return [];
        return form.data.locations.map((value) => {
            return props.countries.find((c) => c.countryCode === value)!;
        });
    }, [popupAdSetId, form.data.locations, props.countries]);

    const isDisabled = useMemo(() => {
        if (form.data.locations.length > 0) {
            return false;
        }

        return true;
    }, [form.data.locations]);

    const minAge = useMemo(() => {
        return form.data.age[0];
    }, [form.data.age]);

    const maxAge = useMemo(() => {
        const maxAge = form.data.age[1];

        if (maxAge === 65) {
            return "65+";
        }

        return maxAge;
    }, [form.data.age]);

    return (
        <Modal
            open={popupAdSetId !== null}
            setOpen={(value) => {
                if (!value) {
                    setPopupAdSetId(null);
                }
            }}
            hideOnInteractOutside={false}
        >
            <div className="p-5 border-b border-gray-100">
                <div>
                    <div className="mb-2 font-semibold">Locations</div>

                    {form.data.locations.length > 0 && (
                        <div className="flex items-center flex-wrap mb-3 gap-1.5">
                            {namedLocations.map((location) => (
                                <div
                                    key={location.countryCode}
                                    className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5"
                                >
                                    <div>{location.name}</div>
                                    <button
                                        onClick={() => {
                                            form.setData((obj) => ({
                                                ...obj,
                                                locations: obj.locations.filter(
                                                    (code) =>
                                                        code !==
                                                        location.countryCode
                                                ),
                                            }));
                                        }}
                                        className="cursor-pointer text-[8px] flex mt-px ml-1"
                                    >
                                        <i className="fa-solid fa-times" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <MultiCombobox
                        placeholder="Search locations..."
                        items={countries}
                        value={form.data.locations}
                        onChange={(values) => {
                            form.setData("locations", values);
                        }}
                    />
                </div>
            </div>
            <div className="p-5 border-b border-gray-100">
                <div>
                    <div className="flex items-center justify-between">
                        <div className="font-semibold">Age range</div>
                        <div className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5">
                            {minAge} - {maxAge}
                        </div>
                    </div>

                    <div>
                        <Slider.Root
                            value={form.data.age}
                            onValueChange={(age) => form.setData("age", age)}
                            min={18}
                            max={65}
                            thumbAlignment="edge"
                        >
                            <Slider.Control className="flex w-full touch-none items-center pt-4 select-none">
                                <Slider.Track className="h-2 w-full rounded bg-gray-100 ring-1 ring-inset ring-black/5 select-none">
                                    <Slider.Indicator className="rounded bg-brand select-none ring-1 ring-inset ring-black/10" />
                                    {[0, 1].map((index) => (
                                        <Slider.Thumb
                                            key={index}
                                            index={index}
                                            className="size-5 rounded-full bg-white shadow-base cursor-pointer select-none flex items-center justify-center"
                                        >
                                            <div
                                                className={cn(
                                                    // "h-[8px] w-[8px] bg-gray-100 rounded-full ring-1 ring-inset ring-gray-200"
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
            </div>
            <div className="p-5">
                <div>
                    <div className="mb-2 font-semibold">Gender</div>
                </div>
            </div>

            {/* Modal footer */}
            <div className="p-5 sticky bottom-0 border-t border-gray-100 bg-white">
                <div className="flex gap-2 justify-end items-center">
                    <Button
                        onClick={() => {
                            setPopupAdSetId(null);
                            form.setData("locations", locations);
                            form.setData("age", age);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        disabled={isDisabled}
                        onClick={() => {
                            if (isDisabled) {
                                return;
                            }

                            updateSetting(
                                popupAdSetId!,
                                "locations",
                                form.data.locations
                            );
                            updateSetting(popupAdSetId!, "age", form.data.age);
                            setPopupAdSetId(null);

                            if (form.isDirty) {
                                toast({
                                    contents: `Settings updated for "${adSetGroup?.label}"`,
                                });
                            }
                        }}
                    >
                        Save changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
