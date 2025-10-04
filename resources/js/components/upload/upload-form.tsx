import { cn } from "@/lib/cn";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { formatFileSize, getBase64, getVideoThumbnail } from "@/lib/utils";
import { UploadedCreative } from "@/pages/upload";
import { router } from "@inertiajs/react";
import { formatDistanceToNowStrict } from "date-fns";
import { useEffect, useMemo, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Select2 } from "../ui/select2";
import { StatusTag } from "../ui/status-tag";
import { Switch } from "../ui/switch";
import { toast } from "../ui/toast";
import { allowedFileTypes } from "./constants";
import { DropboxButton } from "./integrations/dropbox";
import { GoogleDriveButton } from "./integrations/google-drive";
import { defaultCreativeSettings, useUploadContext } from "./upload-context";

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
    const { form } = useUploadContext();
    const { selectedAdAccount } = useSelectedAdAccount();

    const filteredAdSets = useMemo(() => {
        if (!form.data.campaignId || isLoadingAdSets) {
            return [];
        }

        return adSets.filter(
            (adSet) => adSet.campaignId === form.data.campaignId
        );
    }, [isLoadingAdSets, form.data.campaignId, adSets]);

    const filteredInstagramAccounts = useMemo(() => {
        if (!form.data.facebookPageId || isLoadingPages) {
            return [];
        }

        const { instagramAccount } = pages.find(
            (p) => p.id === form.data.facebookPageId
        )!;

        if (!instagramAccount) {
            return [];
        }

        return [instagramAccount];
    }, [form.data.facebookPageId, isLoadingPages, pages]);

    // This pre-selects the facebook page of the selected ad account (and its ig account) - its a nice to have but it might be annoying?
    // useEffect(() => {
    //     if (form.data.facebookPageId || isLoadingPages) {
    //         return;
    //     }

    //     if (!(pages.length > 0)) {
    //         return;
    //     }

    //     const defaultPage = pages.find(
    //         (p) => p.businessId === selectedAdAccount.businessId
    //     );

    //     if (defaultPage) {
    //         form.setData("facebookPageId", defaultPage.id);

    //         const { instagramAccount } = pages.find(
    //             (p) => p.id === defaultPage.id
    //         )!;
    //         if (instagramAccount) {
    //             form.setData("instagramPageId", instagramAccount.id);
    //         }
    //     }
    // }, [
    //     form.data.facebookPageId,
    //     isLoadingPages,
    //     pages,
    //     selectedAdAccount.businessId,
    //     filteredInstagramAccounts,
    // ]);

    useEffect(() => {
        const unsubscribe = router.on("before", (event) => {
            const visit = event.detail.visit;

            // Only trigger confirm for user-initiated navigations
            if (
                form.isDirty &&
                visit.method === "get" &&
                !visit.preserveState
            ) {
                return confirm(
                    "Are you sure you wish to leave the page? Any unsaved changes will be lost."
                );
            }
        });

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (form.isDirty) {
                e.preventDefault();
                e.returnValue = ""; // required for Chrome
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            unsubscribe();
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [form.isDirty]);

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        accept: allowedFileTypes,
        onDrop: async (files) => {
            const creatives = await Promise.all(
                files.map(createUploadedCreative)
            );

            toast({
                contents: `Uploaded ${creatives.length} ${
                    creatives.length > 1 ? "creatives" : "creative"
                }`,
            });

            form.setData("creatives", [...form.data.creatives, ...creatives]);
        },
    });

    const previewsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Track new previews
        form.data.creatives.forEach((creative) => {
            if (creative.preview) {
                previewsRef.current.add(creative.preview);
            }
        });
    }, [form.data.creatives]);

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
                <div className="overflow-y-auto flex-1 min-h-0">
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
                                renderValue={(item) => item.label}
                                items={
                                    !isLoadingCampaigns
                                        ? campaigns.map((campaign) => ({
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

                                                      <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[active-item]:bg-gray-200">
                                                          {campaign.dailyBudget !==
                                                          null
                                                              ? "CBO"
                                                              : "ABO"}
                                                      </div>
                                                  </div>
                                              ),
                                          }))
                                        : []
                                }
                            />
                        </div>
                        <div className="mt-5">
                            <Select
                                label="Ad set"
                                placeholder={
                                    <div className="flex gap-3 items-center">
                                        <div className="h-[8px] w-[8px] rounded-full border-2 border-gray-300" />
                                        <div>Create new ad sets</div>
                                    </div>
                                }
                                value={form.data.adSetId}
                                onChange={(value) =>
                                    form.setData("adSetId", value)
                                }
                                renderValue={(item) => item.label}
                                items={
                                    !isLoadingAdSets
                                        ? filteredAdSets.map((adSet) => ({
                                              value: adSet.id,
                                              label: (
                                                  <div className="flex gap-3 items-center">
                                                      <StatusTag
                                                          status={adSet.status}
                                                          showLabel={false}
                                                      />
                                                      <div className="font-semibold">
                                                          {adSet.name}
                                                      </div>
                                                  </div>
                                              ),
                                          }))
                                        : []
                                }
                            />
                        </div>
                    </div>
                    <div className="p-5 border-t border-gray-100">
                        <div>
                            <Select
                                label="Pixel"
                                placeholder="Select a pixel"
                                value={form.data.pixelId}
                                onChange={(value) =>
                                    form.setData("pixelId", value)
                                }
                                renderValue={(item) => item.label}
                                items={
                                    !isLoadingPixels
                                        ? pixels.map((pixel) => ({
                                              value: pixel.id,
                                              disabled: pixel.isUnavailable,
                                              label: (
                                                  <div className="flex flex-1 gap-3 items-center mr-1 text-left truncate">
                                                      <div className="flex-1 truncate">
                                                          <div className="font-semibold truncate">
                                                              {pixel.name}
                                                          </div>
                                                      </div>

                                                      <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[active-item]:bg-gray-200">
                                                          Last active:{" "}
                                                          {formatDistanceToNowStrict(
                                                              new Date(
                                                                  pixel.lastFiredTime
                                                              ),
                                                              {
                                                                  addSuffix:
                                                                      true,
                                                              }
                                                          )}
                                                      </div>
                                                  </div>
                                              ),
                                          }))
                                        : []
                                }
                            />
                        </div>
                        <div className="mt-5">
                            <label>
                                <span className="block mb-2 font-semibold">
                                    Website URL
                                </span>
                                <input
                                    type="text"
                                    placeholder="Use default website URL"
                                    className="w-full px-3.5 py-2.5 bg-white rounded-lg ring-1 ring-gray-200 placeholder-gray-400 font-semibold focus:ring-2 outline-none focus:ring-offset-1 focus:ring-offset-blue-100 focus:ring-blue-100 transition duration-150 ease-in-out"
                                />
                            </label>
                        </div>
                    </div>
                    <div className="p-5 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-2.5">
                            <Select2
                                label="Facebook page"
                                placeholder="Select a page"
                                items={!isLoadingPages ? pages : []}
                                value={form.data.facebookPageId}
                                onChange={(value) => {
                                    form.setData("facebookPageId", value);

                                    const { instagramAccount } = pages.find(
                                        (p) => p.id === value
                                    )!;
                                    if (instagramAccount) {
                                        form.setData(
                                            "instagramPageId",
                                            instagramAccount.id
                                        );
                                    }
                                }}
                                getItem={(page) => ({
                                    value: page.id,
                                    label: (
                                        <div className="flex flex-1 gap-3 items-center mr-1 text-left truncate">
                                            <div className="flex-1 truncate flex items-center gap-3">
                                                <div className="h-7 w-7 bg-gray-100 rounded-full overflow-hidden shrink-0 relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-[inherit] after:ring-black/5">
                                                    <img
                                                        src={page.picture!}
                                                        className="h-full w-full object-cover object-center"
                                                    />
                                                </div>
                                                <div className="truncate">
                                                    <div className="font-semibold truncate mb-px">
                                                        {page.name}
                                                    </div>
                                                    <div className="text-[12px] font-medium text-gray-500 truncate">
                                                        ID: {page.id}
                                                    </div>
                                                </div>
                                            </div>
                                            {page.businessId !== null &&
                                                selectedAdAccount.businessId ===
                                                    page.businessId && (
                                                    <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[active-item]:bg-gray-200 self-start">
                                                        Default
                                                    </div>
                                                )}
                                        </div>
                                    ),
                                })}
                                getSelectedItem={(page) => (
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 bg-gray-100 rounded-full overflow-hidden shrink-0 relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-[inherit] after:ring-black/5">
                                            <img
                                                src={page.picture!}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>
                                        <div className="font-semibold">
                                            {page.name}
                                        </div>
                                    </div>
                                )}
                            />

                            <Select2
                                label="Instagram account"
                                placeholder="Select a Facebook page"
                                items={
                                    !isLoadingPages
                                        ? filteredInstagramAccounts
                                        : []
                                }
                                value={form.data.instagramPageId}
                                disabled={
                                    filteredInstagramAccounts.length === 0
                                }
                                getDisabledLabel={
                                    form.data.facebookPageId
                                        ? () => (
                                              <div className="font-semibold">
                                                  <span>Use Facebook page</span>
                                              </div>
                                          )
                                        : undefined
                                }
                                onChange={(value) => {
                                    form.setData("instagramPageId", value);
                                }}
                                getItem={(account) => ({
                                    value: account.id,
                                    label: (
                                        <div className="flex flex-1 gap-3 items-center mr-1 text-left truncate">
                                            <div className="flex-1 truncate flex items-center gap-3">
                                                <div className="h-7 w-7 bg-gray-100 rounded-full overflow-hidden shrink-0 relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-[inherit] after:ring-black/5">
                                                    <img
                                                        src={account.picture}
                                                        className="h-full w-full object-cover object-center"
                                                    />
                                                </div>
                                                <div className="truncate">
                                                    <div className="font-semibold truncate mb-px">
                                                        {account.username}
                                                    </div>
                                                    <div className="text-[12px] font-medium text-gray-500 truncate">
                                                        ID: {account.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                })}
                                getSelectedItem={(page) => (
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 bg-gray-100 rounded-full overflow-hidden shrink-0 relative after:absolute after:inset-0 after:ring-1 after:ring-inset after:rounded-[inherit] after:ring-black/5">
                                            <img
                                                src={page.picture}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>
                                        <div className="font-semibold">
                                            {page.username}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                    <div className="p-5 border-t border-gray-100">
                        <div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <span className="block font-semibold">
                                        Upload creatives
                                    </span>

                                    <div>
                                        {/* https://chatgpt.com/c/68d51d71-a918-8332-b642-a591d2891117 */}
                                        <Button>
                                            Import from media library
                                        </Button>
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

                    <div className="p-5 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                            <span className="block font-semibold">
                                Advanced settings
                            </span>

                            <div>
                                <Button>Configure defaults</Button>
                            </div>
                        </div>

                        <div className="rounded-lg divide-y divide-gray-200 ring ring-gray-200">
                            <label className="flex items-start cursor-pointer gap-5 px-5 py-4.5">
                                <Switch
                                    checked={
                                        form.data.settings.paused_by_default
                                    }
                                    onChange={(value) => {
                                        form.setData(
                                            "settings.paused_by_default",
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
                                <div>
                                    <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5">
                                        Recommended
                                    </div>
                                </div>
                            </label>
                            <label className="flex items-start cursor-pointer gap-5 px-5 py-4.5">
                                <Switch
                                    checked={
                                        form.data.settings.disable_enhancements
                                    }
                                    onChange={(value) => {
                                        form.setData(
                                            "settings.disable_enhancements",
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
                                        Turns off all automated Advantage+
                                        optimizations for newly created ads.
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
                                        form.data.settings.disable_promo_codes
                                    }
                                    onChange={(value) => {
                                        form.setData(
                                            "settings.disable_promo_codes",
                                            value
                                        );
                                    }}
                                    className="mt-1.5"
                                />
                                <div className="flex-1">
                                    <div className="mb-1 font-semibold">
                                        Turn off promo codes
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">
                                        Automatically disables promo codes for
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
                </div>
            </div>
        </div>
    );
}

export async function createUploadedCreative(
    file: File
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
        settings: defaultCreativeSettings,
    };
}
