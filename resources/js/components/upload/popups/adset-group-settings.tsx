import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { Radio } from "@/components/ui/radio";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import useDeferred from "@/lib/hooks/use-deferred";
import { AdSetGroupSettings as AdSetGroupSettingsType } from "@/pages/upload";
import { Slider } from "@base-ui-components/react/slider";
import { useForm, usePage } from "@inertiajs/react";
import { useCallback, useMemo } from "react";
import { useUploadedCreativesContext } from "../uploaded-creatives";

function AdSetGroupSettings() {
    const {
        popupAdSetId,
        setPopupAdSetId,
        getSettings,
        updateSetting,
        adSetGroups,
        updateGroupLabel,
    } = useUploadedCreativesContext();

    const adSetGroup = useMemo(() => {
        if (!popupAdSetId) return;
        return adSetGroups.find((g) => g.id === popupAdSetId);
    }, [popupAdSetId, adSetGroups]);

    const { props } = usePage<{ countries: App.Data.TargetingCountryData[] }>();

    const { isLoading: isLoadingCountries } = useDeferred({
        data: ["countries"],
    });

    const { locations, age, gender } = getSettings(popupAdSetId!);

    const form = useForm<AdSetGroupSettingsType & { name: string }>({
        name: adSetGroup?.label || "",
        locations,
        age,
        gender,
    });

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
                    <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-hover:bg-gray-200 group-data-[selected='true']:bg-black/5 group-data-[active-item]:bg-gray-200">
                        {country.countryCode}
                    </div>
                </div>
            ),
            rawLabel: country.name,
            value: country.countryCode,
        }));
    }, [props.countries, isLoadingCountries]);

    const namedLocations = useMemo(() => {
        if (!form.data.locations || isLoadingCountries) {
            return [];
        }

        const named = form.data.locations
            .map((value) => {
                return props.countries.find((c) => c.countryCode === value)!;
            })
            .filter(Boolean);

        if (!(named.length > 0)) {
            return [];
        }

        return named;
    }, [form.data.locations, props.countries, isLoadingCountries]);

    const isDisabled = useMemo(() => {
        const hasName = form.data.name?.trim().length > 0;
        const hasLocations = form.data.locations.length > 0;
        return !(hasName && hasLocations);
    }, [form.data.name, form.data.locations]);

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

    const submit = useCallback(() => {
        if (isDisabled) {
            return;
        }

        if (form.data.name?.trim().length > 0) {
            updateGroupLabel(popupAdSetId!, form.data.name.trim());
        }

        updateSetting(popupAdSetId!, "locations", form.data.locations);
        updateSetting(popupAdSetId!, "age", form.data.age);
        updateSetting(popupAdSetId!, "gender", form.data.gender);
        setPopupAdSetId(null);

        if (form.isDirty) {
            toast({
                contents: `Settings updated for "${
                    form.data.name || adSetGroup?.label
                }"`,
            });
        }
    }, [
        isDisabled,
        form.data.name,
        form.data.locations,
        form.data.age,
        form.data.gender,
        form.isDirty,
        popupAdSetId,
        adSetGroup?.label,
        updateGroupLabel,
        updateSetting,
        setPopupAdSetId,
        toast,
    ]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <div className="p-5 border-b border-gray-100">
                <label>
                    <span className="block mb-2 font-semibold">
                        Name of ad set
                    </span>
                    <Input
                        type="text"
                        value={form.data.name}
                        placeholder={adSetGroup?.label}
                        onChange={(e) => form.setData("name", e.target.value)}
                        required
                    />
                </label>
            </div>
            <div className="p-5 border-b border-gray-100">
                <div>
                    <div className="mb-2 font-semibold">Locations</div>

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
                                            form.setData((obj) => ({
                                                ...obj,
                                                locations: obj.locations.filter(
                                                    (code) =>
                                                        code !==
                                                        location.countryCode
                                                ),
                                            }));
                                        }}
                                        type="button"
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
                        isLoading={isLoadingCountries}
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
                            onValueChange={(age) => {
                                // const [min, max] = age;

                                // Meta restriction: max must be 65, min must be <= 25
                                // When using Advantage+ Audience, the age range must be 25-65+. Switch to Original Audience in your settings to select any age range between 18-65+.
                                // if (max < 65) return;
                                // if (min > 25) return;

                                form.setData("age", age);
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

                    {/* <div className="bg-gray-50 flex ring-1 ring-inset ring-gray-50 px-4 py-3 rounded-lg text-xs leading-relaxed mt-3 gap-4">
                            <i className="fa-regular fa-exclamation-circle mt-[5px] text-sm text-gray-400" />
                            <div>
                                <div className="font-semibold">
                                    Advantage+ Audience
                                </div>
                                <div>
                                    When using Advantage+ Audience, the age
                                    range must be 25-65+. Switch to Original
                                    Audience in your settings to select any age
                                    range between 18-65+.
                                </div>
                            </div>
                        </div> */}
                </div>
            </div>
            <div className="p-5">
                <div>
                    <div className="mb-2 font-semibold">Gender</div>

                    <Radio
                        value={form.data.gender}
                        onChange={(value) =>
                            form.setData("gender", value as any)
                        }
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
            </div>

            {/* Modal footer */}
            <div className="p-5 sticky bottom-0 border-t border-gray-100 bg-white">
                <div className="flex gap-2 justify-end items-center">
                    <Button
                        onClick={() => {
                            setPopupAdSetId(null);
                            // form.setData("name", "");
                            // form.setData("locations", locations);
                            // form.setData("age", age);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        disabled={isDisabled}
                        type="submit"
                    >
                        Save changes
                    </Button>
                </div>
            </div>
        </form>
    );
}

export function AdSetGroupSettingsPopup() {
    const { popupAdSetId, setPopupAdSetId } = useUploadedCreativesContext();

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
            <AdSetGroupSettings />
        </Modal>
    );
}
