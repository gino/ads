import { Layout } from "@/components/layouts/app-layout";
import { Select } from "@/components/ui/select";
import { StatusTag } from "@/components/ui/status-tag";
import useDeferred from "@/lib/hooks/use-deferred";
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
            <div className="bg-white shadow-base rounded-xl overflow-y-auto max-h-full max-w-xl w-full">
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
                                                          title={campaign.name}
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
                                onChange={(value) => setSelectedAdSet(value)}
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
                                value={selectedPixel}
                                onChange={(value) => setSelectedPixel(value)}
                                renderValue={(item) => item.label}
                                items={
                                    !isLoadingPixels
                                        ? pixels.map((pixel) => ({
                                              value: pixel.id,
                                              label: (
                                                  <div className="flex items-center gap-3 truncate">
                                                      <div
                                                          className="font-semibold truncate"
                                                          title={pixel.name}
                                                      >
                                                          {pixel.name}
                                                      </div>
                                                  </div>
                                              ),
                                          }))
                                        : []
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
