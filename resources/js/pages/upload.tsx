import { Layout } from "@/components/layouts/app-layout";
import { Select } from "@/components/ui/select";
import { StatusTag } from "@/components/ui/status-tag";
import useDeferred from "@/lib/hooks/use-deferred";
import { formatDistanceToNowStrict } from "date-fns";
import { useMemo, useState } from "react";

interface Props {
    campaigns: App.Data.AdCampaignData[];
    adSets: App.Data.AdSetData[];
    pixels: App.Data.PixelData[];
}

export default function Upload({ campaigns, adSets, pixels }: Props) {
    const { isLoading: isLoadingCampaigns } = useDeferred({
        data: "campaigns",
    });
    const { isLoading: isLoadingAdSets } = useDeferred({
        data: "adSets",
    });
    const { isLoading: isLoadingPixels } = useDeferred({
        data: "pixels",
    });

    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [selectedAdSet, setSelectedAdSet] = useState("");
    const [selectedPixel, setSelectedPixel] = useState("");

    const filteredAdSets = useMemo(() => {
        if (!selectedCampaign) {
            return [];
        }

        return adSets.filter((adSet) => adSet.campaignId === selectedCampaign);
    }, [selectedCampaign, adSets]);

    return (
        <Layout title="Upload">
            <div className="p-1 bg-gray-100 rounded-2xl ring-inset ring-1 ring-gray-200/30 max-w-3xl mx-auto w-full">
                <div className="bg-white shadow-base rounded-xl">
                    <div>
                        <div className="p-5">
                            <div>
                                <Select
                                    label="Campaign"
                                    placeholder="Select a campaign"
                                    value={selectedCampaign}
                                    onChange={(value) => {
                                        setSelectedCampaign(value);
                                        setSelectedAdSet("");
                                    }}
                                    renderValue={(item) => item.label}
                                    items={
                                        !isLoadingCampaigns
                                            ? campaigns.map((campaign) => ({
                                                  value: campaign.id,
                                                  label: (
                                                      <div className="flex items-center gap-3 truncate">
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
                                                  ),
                                              }))
                                            : []
                                    }
                                />
                                {/* <div className="mt-1.5 text-xs font-medium leading-relaxed text-gray-500">
                                You don't have any required action items to
                                display. If any of your apps need immediate
                                attention in the future, an item will show here.
                            </div> */}
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
                                    value={selectedAdSet}
                                    onChange={(value) =>
                                        setSelectedAdSet(value)
                                    }
                                    renderValue={(item) => item.label}
                                    items={
                                        !isLoadingAdSets
                                            ? filteredAdSets.map((adSet) => ({
                                                  value: adSet.id,
                                                  label: (
                                                      <div className="flex items-center gap-3">
                                                          <StatusTag
                                                              status={
                                                                  adSet.status
                                                              }
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
                                    value={selectedPixel}
                                    onChange={(value) =>
                                        setSelectedPixel(value)
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
                                                                  title={
                                                                      pixel.name
                                                                  }
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
                            <label>
                                <span className="block font-semibold mb-2">
                                    Upload ad creatives
                                </span>

                                <div className="h-48 flex items-center justify-center flex-col rounded-lg border-2 border-dashed border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer group">
                                    <div className="mb-3 text-base bg-gray-100 h-8 w-8 flex items-center justify-center rounded-full group-hover:bg-gray-200">
                                        <i className="fa-regular fa-upload" />
                                    </div>

                                    <div className="font-semibold mb-0.5">
                                        Click to upload creatives
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 mb-3">
                                        or drag and drop your creatives here
                                    </div>
                                    <div className="text-[12px] font-medium text-gray-400">
                                        Accepts images (JPG & PNG) and videos
                                        (MP4 & MOV) up to 4GB
                                    </div>
                                </div>
                            </label>

                            <div className="flex items-center justify-end gap-2 mt-5">
                                <button className="font-semibold shadow-base px-3.5 py-2 rounded-md cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out">
                                    Cancel
                                </button>
                                <button className="font-semibold cursor-pointer active:scale-[0.99] transition-transform duration-100 ease-in-out text-white ring-1 bg-brand ring-brand px-3.5 py-2 rounded-md">
                                    Button
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
