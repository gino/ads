import { MultiComboboxVirtualized } from "@/components/ui/multi-combobox-virtualized";
import useDeferred from "@/lib/hooks/use-deferred";
import { SharedData } from "@/types";
import * as Ariakit from "@ariakit/react";
import { usePage } from "@inertiajs/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { useUploadedCreativesContext } from "../uploaded-creatives";

interface Props {
    //
}

export function AdSetGroupSettingsPopup() {
    const { settingsPopupOpen: open, setSettingsPopupOpen: setOpen } =
        useUploadedCreativesContext();

    const { props } = usePage<
        SharedData & { countries: { country_code: string; name: string }[] }
    >();

    const { isLoading: isLoadingCountries } = useDeferred({
        data: ["countries"],
    });

    const [locations, setLocations] = useState<string[]>([]);

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
                        {country.country_code}
                    </div>
                </div>
            ),
            rawLabel: country.name,
            value: country.country_code,
        }));
    }, [props.countries, isLoadingCountries]);

    const handleLocationsChange = useCallback((values: string[]) => {
        setLocations(values);
    }, []);

    // const namedLocations = useMemo(() => {
    //     return locations.map((value) => {
    //         return countries.find((c) => c.country_code === value)!;
    //     });
    // }, [locations]);

    const dialog = Ariakit.useDialogStore({
        open,
        setOpen: setOpen,
    });
    const mounted = Ariakit.useStoreState(dialog, "mounted");

    return (
        <AnimatePresence>
            {mounted && (
                <Ariakit.Dialog
                    store={dialog}
                    portal
                    alwaysVisible
                    autoFocusOnShow={false}
                    render={(props) => (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            hidden={!open}
                            transition={{ duration: 0.2, ease: "easeIn" }}
                            className="fixed inset-0 bg-black/10 flex items-center justify-center"
                        >
                            <div {...props} />
                        </motion.div>
                    )}
                    className="max-w-lg w-full flex flex-col max-h-[var(--dialog-viewport-height)] py-4 outline-none"
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.98,
                            translateY: 8,
                            filter: "blur(1px)",
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            translateY: 0,
                            filter: "blur(0px)",
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.98,
                            translateY: 8,
                            filter: "blur(1px)",
                        }}
                        transition={{ duration: 0.2, ease: "easeIn" }}
                        className="w-full shadow-xs bg-white/60 p-2 rounded-3xl backdrop-blur-[1px] flex flex-col h-full min-h-0 origin-bottom"
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
                                <div>todo - todo</div>
                            </div>
                            <div className="p-5">
                                <MultiComboboxVirtualized items={countries} />
                            </div>
                            <div className="p-5">
                                <div>
                                    <div className="font-semibold mb-2">
                                        Locations {JSON.stringify(locations)}
                                    </div>

                                    {/* {locations.length > 0 && (
                                        <div className="flex items-center flex-wrap mb-3 gap-1.5">
                                            {namedLocations.map((location) => (
                                                <div
                                                    key={location.country_code}
                                                    className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5"
                                                >
                                                    <div>{location.name}</div>
                                                    <button
                                                        onClick={() => {
                                                            setLocations(
                                                                (locations) => {
                                                                    return locations.filter(
                                                                        (l) =>
                                                                            l !==
                                                                            location.country_code
                                                                    );
                                                                }
                                                            );
                                                        }}
                                                        className="cursor-pointer text-[8px] flex mt-px ml-0.5"
                                                    >
                                                        <i className="fa-solid fa-times" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )} */}

                                    {/* <MultiCombobox
                                        items={countries}
                                        value={locations}
                                        onChange={handleLocationsChange}
                                    /> */}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center justify-end gap-2">
                                    <Ariakit.DialogDismiss className="bg-white font-semibold shadow-base px-3.5 py-2 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out">
                                        Cancel
                                    </Ariakit.DialogDismiss>
                                    <button className="font-semibold cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out text-white ring-1 bg-brand ring-brand px-3.5 py-2 rounded-md">
                                        Save changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </Ariakit.Dialog>
            )}
        </AnimatePresence>
    );
}
