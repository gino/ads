import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import useDeferred from "@/lib/hooks/use-deferred";
import { AdSetGroupSettings } from "@/pages/upload";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo } from "react";
import { useUploadedCreativesContext } from "../uploaded-creatives";

export function AdSetGroupSettingsPopup() {
    const { popupAdSetId, setPopupAdSetId, getSettings, updateSetting } =
        useUploadedCreativesContext();

    const { props } = usePage<{ countries: App.Data.TargetingCountryData[] }>();

    const { isLoading: isLoadingCountries } = useDeferred({
        data: ["countries"],
    });

    const { locations } = getSettings(popupAdSetId!);

    const form = useForm<AdSetGroupSettings>({
        locations,
    });

    useEffect(() => {
        if (!popupAdSetId) return;
        // Do this for every property inside of `form`
        form.setData("locations", locations);
    }, [popupAdSetId, locations]);

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
            {/* <div className="p-5">
                <div>{popupAdSetId}</div>
            </div> */}
            <div className="p-5">
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
                                        className="cursor-pointer text-[8px] flex mt-px ml-0.5"
                                    >
                                        <i className="fa-solid fa-times" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <MultiCombobox
                        items={countries}
                        value={form.data.locations}
                        onChange={(values) => {
                            form.setData("locations", values);
                        }}
                    />
                </div>
            </div>
            <div className="p-5">
                <div>
                    <div className="mb-2 font-semibold">Age range</div>
                </div>
            </div>

            <div className="p-5">
                <div className="flex gap-2 justify-end items-center">
                    <button
                        onClick={() => {
                            setPopupAdSetId(null);
                            form.setData("locations", locations);
                        }}
                        className="bg-white font-semibold shadow-base px-3.5 py-2 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out"
                    >
                        Cancel
                    </button>
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
                            setPopupAdSetId(null);
                        }}
                    >
                        Save changes
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
