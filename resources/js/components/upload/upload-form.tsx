import { cn } from "@/lib/cn";
import { formatFileSize, getVideoThumbnail } from "@/lib/utils";
import { UploadedCreative, UploadForm as UploadFormType } from "@/pages/upload";
import { InertiaFormProps, router } from "@inertiajs/react";
import { formatDistanceToNowStrict } from "date-fns";
import { useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { Select } from "../ui/select";
import { StatusTag } from "../ui/status-tag";

interface Props {
    form: InertiaFormProps<UploadFormType>;
    //
    campaigns: App.Data.AdCampaignData[];
    adSets: App.Data.AdSetData[];
    pixels: App.Data.PixelData[];
    //
    isLoadingCampaigns: boolean;
    isLoadingAdSets: boolean;
    isLoadingPixels: boolean;
}

export function UploadForm({
    form,
    campaigns,
    adSets,
    pixels,
    isLoadingCampaigns,
    isLoadingAdSets,
    isLoadingPixels,
}: Props) {
    const filteredAdSets = useMemo(() => {
        if (!form.data.campaignId) {
            return [];
        }

        return adSets.filter(
            (adSet) => adSet.campaignId === form.data.campaignId
        );
    }, [form.data.campaignId, adSets]);

    useEffect(() => {
        const unsubscribe = router.on("before", () => {
            if (form.isDirty) {
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
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "video/mp4": [],
            "video/quicktime": [],
        },
        onDrop: async (files) => {
            const creatives = await Promise.all(
                files.map(async (file): Promise<UploadedCreative> => {
                    let thumbnail = null;

                    if (file.type.startsWith("video/")) {
                        thumbnail = await getVideoThumbnail(file);
                    } else {
                        thumbnail = URL.createObjectURL(file);
                    }

                    return {
                        id: crypto.randomUUID().toString(),
                        name: file.name,
                        size: formatFileSize(file.size),
                        file,
                        preview: thumbnail,
                        type: file.type,
                        thumbnail,
                    };
                })
            );

            form.setData("creatives", [...form.data.creatives, ...creatives]);
        },
    });

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
        // From: https://react-dropzone.js.org/#section-previews
        return () => {
            form.data.creatives.forEach((file) =>
                URL.revokeObjectURL(file.preview)
            );
        };
    }, [form.data.creatives]);

    return (
        <div className="min-w-0 p-1 bg-gray-100 rounded-2xl shrink-0 ring-inset ring-1 ring-gray-200/30 h-full min-h-0">
            <div className="bg-white shadow-base rounded-xl overflow-hidden h-full flex flex-col min-h-0">
                <div className="flex-1 min-h-0 overflow-y-auto">
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
                                                  <div className="flex flex-1 text-left mr-1 items-center gap-3 truncate">
                                                      <div className="flex-1 flex items-center gap-3 truncate">
                                                          <StatusTag
                                                              status={
                                                                  campaign.effectiveStatus
                                                              }
                                                              showLabel={false}
                                                          />
                                                          <div
                                                              className="font-semibold truncate"
                                                              title={
                                                                  campaign.name
                                                              }
                                                          >
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
                                    <div className="flex items-center gap-3">
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
                                                  <div className="flex items-center gap-3">
                                                      <StatusTag
                                                          status={adSet.status}
                                                          showLabel={false}
                                                      />
                                                      <div
                                                          className="font-semibold"
                                                          title={adSet.name}
                                                      >
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
                                                  <div className="flex items-center text-left gap-3 flex-1 truncate mr-1">
                                                      <div className="flex-1 truncate">
                                                          <div
                                                              className="font-semibold truncate"
                                                              title={pixel.name}
                                                          >
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
                                    className="w-full px-3.5 py-2.5 bg-white rounded-lg ring-1 ring-gray-200 placeholder-gray-400 font-semibold"
                                />
                            </label>
                        </div>
                    </div>
                    <div className="p-5 border-t border-gray-100">
                        <div>
                            <label>
                                <div className="flex items-center justify-between">
                                    <span className="block font-semibold">
                                        Upload creatives
                                    </span>

                                    <div>
                                        <button className="bg-white font-semibold shadow-base px-3.5 py-2 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out">
                                            Choose from ad library
                                        </button>
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
                                        <div className="text-xs font-medium text-gray-500 mb-3">
                                            or drag and drop your creatives here
                                        </div>
                                        <div className="text-[12px] font-medium text-gray-400">
                                            Accepts images (JPG & PNG) and
                                            videos (MP4 & MOV) up to 4GB
                                        </div>
                                    </div>
                                </div>
                            </label>

                            <div className="grid grid-cols-2 items-center gap-3">
                                <button className="bg-white font-semibold flex justify-center items-center gap-2 shadow-base px-3.5 py-2.5 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out">
                                    <i className="-ml-0.5 fa-brands fa-dropbox text-[#0061FE]" />
                                    <span>Choose from Dropbox</span>
                                </button>

                                <button className="bg-white font-semibold flex justify-center items-center gap-2 shadow-base px-3.5 py-2.5 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out">
                                    <i className="-ml-0.5 fa-brands fa-google-drive text-[#4285F4]" />
                                    <span>Choose from Google Drive</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
