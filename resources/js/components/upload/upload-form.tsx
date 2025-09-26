import { cn } from "@/lib/cn";
import { formatFileSize, getBase64, getVideoThumbnail } from "@/lib/utils";
import { UploadedCreative } from "@/pages/upload";
import { router } from "@inertiajs/react";
import { formatDistanceToNowStrict } from "date-fns";
import { useEffect, useMemo, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { StatusTag } from "../ui/status-tag";
import { Switch } from "../ui/switch";
import { toast } from "../ui/toast";
import { allowedFileTypes } from "./constants";
import { DropboxButton } from "./integrations/dropbox";
import { GoogleDriveButton } from "./integrations/google-drive";
import { useUploadContext } from "./upload-context";

interface Props {
    campaigns: App.Data.AdCampaignData[];
    adSets: App.Data.AdSetData[];
    pixels: App.Data.PixelData[];
    //
    isLoadingCampaigns: boolean;
    isLoadingAdSets: boolean;
    isLoadingPixels: boolean;
}

export function UploadForm({
    campaigns,
    adSets,
    pixels,
    isLoadingCampaigns,
    isLoadingAdSets,
    isLoadingPixels,
}: Props) {
    const { form } = useUploadContext();

    const filteredAdSets = useMemo(() => {
        if (!form.data.campaignId || isLoadingAdSets) {
            return [];
        }

        return adSets.filter(
            (adSet) => adSet.campaignId === form.data.campaignId
        );
    }, [isLoadingAdSets, form.data.campaignId, adSets]);

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
                        <div>
                            <label>
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
                            </label>

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
                                <Switch className="mt-1" />
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
                                <Switch className="mt-1" />
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
                                <Switch className="mt-1" />
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
    };
}
