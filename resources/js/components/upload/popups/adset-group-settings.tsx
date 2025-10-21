import { AgeRangeInput } from "@/components/shared-inputs/age-range-input";
import { GenderInput } from "@/components/shared-inputs/gender-input";
import { LocationsInput } from "@/components/shared-inputs/locations-input";
import { Button } from "@/components/ui/button";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { TimeInput } from "@/components/ui/time-input";
import { toast } from "@/components/ui/toast";
import useDeferred from "@/lib/hooks/use-deferred";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { AdSetGroupSettings as AdSetGroupSettingsType } from "@/pages/upload";
import { useForm, usePage } from "@inertiajs/react";
import { useCallback, useMemo } from "react";
import { useUploadedCreativesContext } from "../uploaded-creatives";

function AdSetGroupSettings() {
    const { selectedAdAccount } = useSelectedAdAccount();

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

    const { locations, age, gender, startDate } = getSettings(popupAdSetId!);

    const form = useForm<AdSetGroupSettingsType & { name: string }>({
        name: adSetGroup?.label || "",
        locations,
        age,
        gender,
        startDate,
    });

    const isDisabled = useMemo(() => {
        const hasName = form.data.name?.trim().length > 0;
        const hasLocations = form.data.locations.length > 0;

        const hasStartDate =
            form.data.startDate !== null &&
            form.data.startDate.getTime() > new Date().getTime();

        return !(hasName && hasLocations && hasStartDate);
    }, [form.data.name, form.data.locations, form.data.startDate]);

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
        updateSetting(popupAdSetId!, "startDate", form.data.startDate);
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
                <label>
                    <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">Start date</div>
                        <div className="font-semibold flex items-center bg-gray-100 text-[12px] px-2 rounded-full leading-5">
                            {selectedAdAccount.timezone}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                        <DatePickerInput
                            value={form.data.startDate}
                            onChange={(date) => form.setData("startDate", date)}
                            utcOffset={selectedAdAccount.timezoneOffsetUtc}
                        />
                        <TimeInput
                            value={form.data.startDate}
                            onChange={(date) => form.setData("startDate", date)}
                            utcOffset={selectedAdAccount.timezoneOffsetUtc}
                        />
                    </div>
                </label>
            </div>
            <div className="p-5 border-b border-gray-100">
                <LocationsInput
                    countries={props.countries}
                    isLoading={isLoadingCountries}
                    value={form.data.locations}
                    onChange={(values) => {
                        form.setData("locations", values);
                    }}
                />
            </div>
            <div className="p-5 border-b border-gray-100">
                <AgeRangeInput
                    value={form.data.age}
                    onChange={(range) => {
                        form.setData("age", range);
                    }}
                />
            </div>
            <div className="p-5">
                <GenderInput
                    value={form.data.gender}
                    onChange={(value) => {
                        form.setData("gender", value as any);
                    }}
                />
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
