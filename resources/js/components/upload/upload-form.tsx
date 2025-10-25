import { cn } from "@/lib/cn";
import { formatFileSize, getBase64, getVideoThumbnail } from "@/lib/utils";
import {
    CreativeSettings,
    UploadedCreative,
    UploadFormDefaults,
} from "@/pages/upload";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { PagesInput } from "../shared-inputs/pages-input";
import { PixelInput } from "../shared-inputs/pixel-input";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { StatusTag } from "../ui/status-tag";
import { Switch } from "../ui/switch";
import { toast } from "../ui/toast";
import { allowedFileTypes } from "./constants";
import { DropboxButton } from "./integrations/dropbox";
import { GoogleDriveButton } from "./integrations/google-drive";
import { MediaLibraryButton } from "./popups/media-library";
import { useUploadContext } from "./upload-context";

interface Props {
    campaigns: App.Data.AdCampaignData[];
    adSets: App.Data.AdSetData[];
    pixels: App.Data.PixelData[];
    pages: App.Data.FacebookPageData[];
    //
    isLoadingCampaigns: boolean;
    isLoadingAdSets: boolean;
    isLoadingPixels: boolean;
    isLoadingPages: boolean;
}

export function UploadForm({
    campaigns,
    adSets,
    pixels,
    pages,
    isLoadingCampaigns,
    isLoadingAdSets,
    isLoadingPixels,
    isLoadingPages,
}: Props) {
    const {
        props: { defaults },
    } = usePage<{ defaults: UploadFormDefaults }>();
    const { form, creatives, setCreatives, defaultCreativeSettings } =
        useUploadContext();

    // Fetch ad sets for selected campaign
    useEffect(() => {
        if (!form.data.campaignId) return;
        router.get(
            "/upload",
            {
                campaignId: form.data.campaignId,
            },
            {
                only: ["adSets"],
                preserveState: true,
                preserveUrl: true,
            }
        );
    }, [form.data.campaignId]);

    const isDirtyCreatives = creatives.length > 0;
    const isDirty = form.isDirty || isDirtyCreatives;

    useEffect(() => {
        const unsubscribe = router.on("before", (event) => {
            const visit = event.detail.visit;

            if (isDirty && visit.method === "get" && !visit.preserveState) {
                return confirm(
                    "Are you sure you wish to leave the page? Any unsaved changes will be lost."
                );
            }
        });

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ""; // required for Chrome
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            unsubscribe();
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isDirty]);

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        accept: allowedFileTypes,
        onDrop: async (files) => {
            const mappedCreatives = await Promise.all(
                files.map((file) =>
                    createUploadedCreative(file, defaultCreativeSettings)
                )
            );

            toast({
                contents: `Uploaded ${mappedCreatives.length} ${
                    mappedCreatives.length > 1 ? "creatives" : "creative"
                }`,
            });

            setCreatives((prev) => [...prev, ...mappedCreatives]);
        },
    });

    const previewsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Track new previews
        creatives.forEach((creative) => {
            if (creative.preview) {
                previewsRef.current.add(creative.preview);
            }
        });
    }, [creatives]);

    useEffect(() => {
        // Revoke all previews on unmount
        return () => {
            previewsRef.current.forEach((preview) => {
                URL.revokeObjectURL(preview);
            });
            previewsRef.current.clear();
        };
    }, []);

    return (
        <div className="p-1 min-w-0 h-full min-h-0 bg-gray-100 rounded-2xl ring-1 ring-inset shrink-0 ring-gray-200/30">
            <div className="flex overflow-hidden flex-col h-full min-h-0 bg-white rounded-xl shadow-base">
                <div className="overflow-y-auto flex-1 min-h-0 divide-y divide-gray-100">
                    <div className="p-5">
                        <div>
                            <Select
                                label="Campaign"
                                placeholder="Select a campaign"
                                value={form.data.campaignId}
                                onChange={(value) => {
                                    form.setData("campaignId", value);
                                    form.reset("adSetId");
                                }}
                                isLoading={isLoadingCampaigns}
                                items={campaigns}
                                getItem={(campaign) => ({
                                    value: campaign.id,
                                    label: (
                                        <div className="flex flex-1 gap-3 items-center mr-1 text-left truncate">
                                            <div className="flex flex-1 gap-3 items-center truncate">
                                                <StatusTag
                                                    status={
                                                        campaign.effectiveStatus
                                                    }
                                                    showLabel={false}
                                                />
                                                <div className="font-semibold truncate">
                                                    {campaign.name}
                                                </div>
                                            </div>

                                            <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-hover:bg-gray-200 group-data-[selected='true']:bg-black/5 group-data-[active-item]:bg-gray-200">
                                                {campaign.dailyBudget !== null
                                                    ? "CBO"
                                                    : "ABO"}
                                            </div>
                                        </div>
                                    ),
                                })}
                            />
                        </div>
                        <div className="mt-5">
                            <Select
                                label="Ad set"
                                disabled={!form.data.campaignId}
                                placeholder={
                                    !form.data.campaignId ? (
                                        "Select a campaign"
                                    ) : (
                                        <div className="flex gap-3 items-center">
                                            <div className="h-[8px] w-[8px] rounded-full border-2 border-gray-300" />
                                            <div>Create new ad sets</div>
                                        </div>
                                    )
                                }
                                value={form.data.adSetId}
                                onChange={(value) =>
                                    form.setData("adSetId", value)
                                }
                                isLoading={
                                    isLoadingAdSets || isLoadingCampaigns
                                }
                                items={adSets}
                                getItem={(adSet) => ({
                                    value: adSet.id,
                                    label: (
                                        <div className="flex flex-1 gap-3 items-center mr-1 text-left truncate">
                                            <div className="flex flex-1 gap-3 items-center truncate">
                                                <StatusTag
                                                    status={adSet.status}
                                                    showLabel={false}
                                                />
                                                <div className="font-semibold">
                                                    {adSet.name}
                                                </div>
                                            </div>
                                            {adSet.dailyBudget !== null && (
                                                <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-hover:bg-gray-200 group-data-[selected='true']:bg-black/5 group-data-[active-item]:bg-gray-200">
                                                    ABO
                                                </div>
                                            )}
                                        </div>
                                    ),
                                })}
                            />
                        </div>
                    </div>
                    {!defaults.pixelId && (
                        <div className="p-5">
                            <PixelInput
                                value={form.data.pixelId}
                                onChange={(value) => {
                                    form.setData("pixelId", value);
                                }}
                                pixels={pixels}
                                isLoading={isLoadingPixels}
                            />
                        </div>
                    )}

                    <div className="p-5">
                        <label>
                            <span className="block mb-2 font-semibold">
                                Website URL
                            </span>
                            <Input
                                type="text"
                                placeholder="e.g. the URL of your product page"
                                value={form.data.websiteUrl}
                                onChange={(e) =>
                                    form.setData("websiteUrl", e.target.value)
                                }
                            />
                        </label>
                    </div>

                    {!defaults.facebookPageId && (
                        <div className="p-5">
                            <PagesInput
                                pages={pages}
                                isLoading={isLoadingPages}
                                facebookPageId={form.data.facebookPageId}
                                instagramPageId={form.data.instagramPageId}
                                onChangeFacebookPageId={(value) => {
                                    form.setData("facebookPageId", value);
                                }}
                                onChangeInstagramPageId={(value) => {
                                    form.setData("instagramPageId", value);
                                }}
                            />
                        </div>
                    )}
                    <div className="p-5">
                        <div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <span className="block font-semibold">
                                        Upload creatives
                                    </span>

                                    <div>
                                        {/* https://chatgpt.com/c/68d51d71-a918-8332-b642-a591d2891117 */}
                                        <MediaLibraryButton />
                                    </div>
                                </div>

                                <div className="my-3">
                                    <div
                                        className={cn(
                                            "h-48 flex items-center justify-center flex-col rounded-lg border-2 border-dashed border-gray-200 hover:bg-gray-50 hover:border-gray-300 group",
                                            isDragActive &&
                                                isDragAccept &&
                                                "bg-gray-50 border-gray-300 ring-2 ring-offset-2 ring-blue-100",
                                            isDragReject
                                                ? "cursor-not-allowed"
                                                : "cursor-pointer"
                                        )}
                                        {...getRootProps()}
                                    >
                                        <input
                                            className="hidden"
                                            {...getInputProps()}
                                        />

                                        <div className="mb-2 text-xl">
                                            <i className="fa-regular fa-circle-arrow-up" />
                                        </div>

                                        <div className="font-semibold mb-0.5">
                                            {isDragActive && isDragAccept
                                                ? "Drop your creatives here"
                                                : "Click to upload creatives"}
                                        </div>
                                        <div className="mb-3 text-xs font-medium text-gray-500">
                                            or drag and drop your creatives here
                                        </div>
                                        <div className="text-[12px] font-medium text-gray-400">
                                            Accepts images (JPG & PNG) and
                                            videos (MP4 & MOV) up to 4GB
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 items-center">
                                <DropboxButton />
                                <GoogleDriveButton />
                            </div>
                        </div>
                    </div>

                    {!defaults.utmParameters && (
                        <div className="p-5">
                            <label>
                                <span className="block mb-2 font-semibold">
                                    UTM parameters
                                </span>
                                <Input
                                    type="text"
                                    placeholder="utm_campaign={{campaign.id}}&utm_ad_group={{adset.id}}&utm_ad={{ad.id}}&utm_source=meta"
                                    value={form.data.utmParameters}
                                    onChange={(e) => {
                                        form.setData(
                                            "utmParameters",
                                            e.target.value
                                        );
                                    }}
                                />
                            </label>
                        </div>
                    )}

                    <div className="p-5">
                        <span className="block mb-3 font-semibold">
                            Ad launch settings
                        </span>

                        <div className="rounded-lg divide-y divide-gray-200 ring ring-gray-200">
                            <label className="flex items-start cursor-pointer gap-5 px-5 py-4.5">
                                <Switch
                                    checked={form.data.settings.pausedByDefault}
                                    onChange={(value) => {
                                        form.setData(
                                            "settings.pausedByDefault",
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
                                        Newly created ads are paused by default,
                                        instead of the active state.
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
                                        form.data.settings.disableEnhancements
                                    }
                                    onChange={(value) => {
                                        form.setData(
                                            "settings.disableEnhancements",
                                            value
                                        );
                                    }}
                                    className="mt-1.5"
                                />
                                <div className="flex-1">
                                    <div className="mb-1 font-semibold">
                                        Disable all Advantage+ enhancements
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">
                                        Turns off all Advantage+ optimizations
                                        for newly created ads.
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
                                    checked={form.data.settings.disableMultiAds}
                                    onChange={(value) => {
                                        form.setData(
                                            "settings.disableMultiAds",
                                            value
                                        );
                                    }}
                                    className="mt-1.5"
                                />
                                <div className="flex-1">
                                    <div className="mb-1 font-semibold">
                                        Turn off Multi-advertiser ads
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">
                                        Automatically disables Multi-advertiser
                                        ads for newly created ads.
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
                </div>
            </div>
        </div>
    );
}

export async function createUploadedCreative(
    file: File,
    settings: CreativeSettings
): Promise<UploadedCreative> {
    let thumbnail: string | null = null;

    if (file.type.startsWith("video/")) {
        thumbnail = await getVideoThumbnail(file);
    } else {
        thumbnail = await getBase64(file);
    }

    return {
        id: crypto.randomUUID().toString(),
        name: file.name.substring(0, file.name.lastIndexOf(".")),
        extension: file.name.split(".").pop()!,
        size: formatFileSize(file.size),
        file,
        preview: URL.createObjectURL(file),
        type: file.type,
        thumbnail,
        settings,
    };
}
