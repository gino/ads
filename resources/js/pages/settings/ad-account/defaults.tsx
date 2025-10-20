import { Layout } from "@/components/layouts/settings-layout";
import { SettingsHeader } from "@/components/settings/settings-header";
import { LocationsInput } from "@/components/shared-inputs/locations-input";
import { PagesInput } from "@/components/shared-inputs/pages-input";
import { PixelInput } from "@/components/shared-inputs/pixel-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import useDeferred from "@/lib/hooks/use-deferred";
import { useSyncedForm } from "@/lib/hooks/use-synced-form";

interface Props {
    defaults: {
        websiteUrl: string | null;
        pixelId: string | null;
        facebookPageId: string | null;
        instagramPageId: string | null;
        utmParameters: string | null;
        pausedByDefault: boolean;
        disableEnhancements: boolean;
        disableMultiAds: boolean;
        locations: string[];
    };
    pixels: App.Data.PixelData[];
    pages: App.Data.FacebookPageData[];
    countries: App.Data.TargetingCountryData[];
}

export default function Defaults({
    defaults,
    pixels,
    pages,
    countries,
}: Props) {
    const form = useSyncedForm({
        websiteUrl: defaults.websiteUrl ?? "",
        pixelId: defaults.pixelId ?? "",
        facebookPageId: defaults.facebookPageId ?? "",
        instagramPageId: defaults.instagramPageId ?? "",
        utmParameters: defaults.utmParameters ?? "",
        pausedByDefault: defaults.pausedByDefault ?? false,
        disableEnhancements: defaults.disableEnhancements ?? true,
        disableMultiAds: defaults.disableMultiAds ?? true,
        locations: defaults.locations ?? [],
    });

    const { isLoading: isLoadingPixels } = useDeferred({
        data: "pixels",
    });

    const { isLoading: isLoadingPages } = useDeferred({
        data: "pages",
    });

    const { isLoading: isLoadingCountries } = useDeferred({
        data: "countries",
    });

    const isDisabled = !form.isDirty;

    return (
        <Layout title="Defaults">
            <div className="p-3">
                <div className="max-w-3xl mx-auto">
                    <div className="p-1 bg-gray-100 rounded-2xl ring-gray-200/30 ring-inset ring-1">
                        <div className="bg-white rounded-xl shadow-base divide-y divide-gray-100">
                            <div className="px-5 py-4 flex items-center">
                                <SettingsHeader includeAdAccount>
                                    Defaults
                                </SettingsHeader>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();

                                    if (isDisabled) {
                                        return;
                                    }

                                    form.patch(route("update-defaults"), {
                                        preserveState: true,
                                        onSuccess: () => {
                                            toast({
                                                contents:
                                                    "Defaults saved successfully",
                                            });
                                        },
                                        onError: (errors) => {
                                            console.log(errors);
                                            toast({
                                                type: "ERROR",
                                                contents:
                                                    "Something went wrong, please try again.",
                                            });
                                        },
                                    });
                                }}
                                className="divide-y divide-gray-100"
                            >
                                <div className="p-5">
                                    <label>
                                        <span className="block mb-2 font-semibold">
                                            Default website URL
                                        </span>
                                        <Input
                                            type="url"
                                            value={form.data.websiteUrl}
                                            onChange={(e) => {
                                                form.setData(
                                                    "websiteUrl",
                                                    e.target.value
                                                );
                                            }}
                                            placeholder="e.g. the URL of your store"
                                        />
                                    </label>
                                </div>
                                <div className="p-5">
                                    <PixelInput
                                        label="Default pixel"
                                        value={form.data.pixelId}
                                        onChange={(value) => {
                                            form.setData("pixelId", value);
                                        }}
                                        pixels={pixels}
                                        isLoading={isLoadingPixels}
                                    />
                                </div>
                                <div className="p-5">
                                    <PagesInput
                                        labels={[
                                            "Default Facebook page",
                                            "Default Instagram account",
                                        ]}
                                        pages={pages}
                                        isLoading={isLoadingPages}
                                        facebookPageId={
                                            form.data.facebookPageId
                                        }
                                        instagramPageId={
                                            form.data.instagramPageId
                                        }
                                        onChangeFacebookPageId={(value) => {
                                            form.setData(
                                                "facebookPageId",
                                                value
                                            );
                                        }}
                                        onChangeInstagramPageId={(value) => {
                                            form.setData(
                                                "instagramPageId",
                                                value
                                            );
                                        }}
                                    />
                                </div>
                                <div className="p-5">
                                    <label>
                                        <span className="block mb-2 font-semibold">
                                            Default UTM parameters
                                        </span>
                                        <Input
                                            type="text"
                                            value={form.data.utmParameters}
                                            onChange={(e) => {
                                                form.setData(
                                                    "utmParameters",
                                                    e.target.value
                                                );
                                            }}
                                            placeholder="utm_campaign={{campaign.id}}&utm_ad_group={{adset.id}}&utm_ad={{ad.id}}&utm_source=meta"
                                        />
                                    </label>
                                </div>
                                <div className="p-5">
                                    <LocationsInput
                                        label="Default targeting locations"
                                        countries={countries}
                                        isLoading={isLoadingCountries}
                                        value={form.data.locations}
                                        onChange={(locations) => {
                                            form.setData(
                                                "locations",
                                                locations
                                            );
                                        }}
                                    />
                                </div>
                                <div className="p-5">
                                    <span className="block mb-3 font-semibold">
                                        Default ad launch settings
                                    </span>

                                    <div className="rounded-lg divide-y divide-gray-200 ring ring-gray-200">
                                        <label className="flex items-start cursor-pointer gap-5 px-5 py-4.5">
                                            <Switch
                                                checked={
                                                    form.data.pausedByDefault
                                                }
                                                onChange={(value) => {
                                                    form.setData(
                                                        "pausedByDefault",
                                                        value
                                                    );
                                                }}
                                                className="mt-1.5"
                                            />
                                            <div className="flex-1">
                                                <div className="mb-1 font-semibold">
                                                    Default ads to paused
                                                </div>
                                                <div className="text-xs font-medium text-gray-500">
                                                    Newly created ads are paused
                                                    by default, instead of the
                                                    active state.
                                                </div>
                                            </div>
                                            {/* <div>
                                    <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5">
                                        Recommended
                                    </div>
                                </div> */}
                                        </label>
                                        <label className="flex items-start cursor-pointer gap-5 px-5 py-4.5">
                                            <Switch
                                                checked={
                                                    form.data
                                                        .disableEnhancements
                                                }
                                                onChange={(value) => {
                                                    form.setData(
                                                        "disableEnhancements",
                                                        value
                                                    );
                                                }}
                                                className="mt-1.5"
                                            />
                                            <div className="flex-1">
                                                <div className="mb-1 font-semibold">
                                                    Disable all Advantage+
                                                    enhancements
                                                </div>
                                                <div className="text-xs font-medium text-gray-500">
                                                    Turns off all Advantage+
                                                    optimizations for newly
                                                    created ads.
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5">
                                                    Recommended
                                                </div>
                                            </div>
                                        </label>
                                        <label className="flex items-start cursor-pointer gap-5 px-5 py-4.5">
                                            <Switch
                                                checked={
                                                    form.data.disableMultiAds
                                                }
                                                onChange={(value) => {
                                                    form.setData(
                                                        "disableMultiAds",
                                                        value
                                                    );
                                                }}
                                                className="mt-1.5"
                                            />
                                            <div className="flex-1">
                                                <div className="mb-1 font-semibold">
                                                    Turn off Multi-advertiser
                                                    ads
                                                </div>
                                                <div className="text-xs font-medium text-gray-500">
                                                    Automatically disables
                                                    Multi-advertiser ads for
                                                    newly created ads.
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5">
                                                    Recommended
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="p-5 flex justify-end items-center">
                                    <Button
                                        type="submit"
                                        disabled={isDisabled}
                                        variant="primary"
                                        loading={form.processing}
                                    >
                                        Save changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
