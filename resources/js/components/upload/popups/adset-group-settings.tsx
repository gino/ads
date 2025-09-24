import { Modal } from "@/components/ui/modal";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import useDeferred from "@/lib/hooks/use-deferred";
import * as Ariakit from "@ariakit/react";
import { usePage } from "@inertiajs/react";
import { useMemo } from "react";
import { useUploadedCreativesContext } from "../uploaded-creatives";

export function AdSetGroupSettingsPopup() {
    const { popupAdSetId, setPopupAdSetId, getSettings, updateSetting } =
        useUploadedCreativesContext();

    const { props } = usePage<{ countries: App.Data.TargetingCountryData[] }>();

    const { isLoading: isLoadingCountries } = useDeferred({
        data: ["countries"],
    });

    const { locations } = getSettings(popupAdSetId!);

    const countries = useMemo(() => {
        if (isLoadingCountries) return [];
        return props.countries.map((country) => ({
            label: (
                <div className="flex items-center text-left gap-3 flex-1 truncate mr-1">
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
        if (!locations || !popupAdSetId) return [];
        return locations.map((value) => {
            return props.countries.find((c) => c.countryCode === value)!;
        });
    }, [popupAdSetId, locations, props.countries]);

    return (
        <Modal
            open={popupAdSetId !== null}
            setOpen={(value) => {
                if (!value) {
                    setPopupAdSetId(null);
                }
            }}
        >
            <div className="bg-white w-full rounded-2xl shadow-dialog overflow-y-auto divide-y divide-gray-100">
                {/* <Ariakit.DialogHeading className="p-5 sticky top-0 bg-white border-b border-gray-100">
                                <div>
                                    <div className="font-semibold text-base">
                                        Audience targeting
                                    </div>
                                    <div className="font-medium text-gray-500 text-sm">
                                        Configuring{" "}
                                        <span className="text-black font-semibold">
                                            {label}
                                        </span>
                                    </div>
                                </div>
                            </Ariakit.DialogHeading> */}
                <div className="p-5">
                    <div>{popupAdSetId}</div>
                </div>
                <div className="p-5">
                    <div>
                        <div className="font-semibold mb-2">Locations</div>

                        {locations.length > 0 && (
                            <div className="flex items-center flex-wrap mb-3 gap-1.5">
                                {namedLocations.map((location) => (
                                    <div
                                        key={location.countryCode}
                                        className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5"
                                    >
                                        <div>{location.name}</div>
                                        <button
                                            onClick={() => {
                                                const filtered =
                                                    locations.filter(
                                                        (code) =>
                                                            code !==
                                                            location.countryCode
                                                    );
                                                updateSetting(
                                                    popupAdSetId!,
                                                    "locations",
                                                    filtered
                                                );
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
                            value={locations}
                            onChange={(values) =>
                                updateSetting(
                                    popupAdSetId!,
                                    "locations",
                                    values
                                )
                            }
                        />
                    </div>
                </div>
                <div className="p-5">
                    <div>
                        <div className="font-semibold mb-2">Age range</div>
                    </div>
                </div>

                <div className="p-5">
                    <div className="flex items-center justify-end gap-2">
                        <Ariakit.DialogDismiss className="bg-white font-semibold shadow-base px-3.5 py-2 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out">
                            Cancel
                        </Ariakit.DialogDismiss>
                        <Ariakit.DialogDismiss className="font-semibold cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out text-white ring-1 bg-brand ring-brand px-3.5 py-2 rounded-md">
                            Save changes
                        </Ariakit.DialogDismiss>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
