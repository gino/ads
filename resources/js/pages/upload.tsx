import { Layout } from "@/components/layouts/app-layout";
import { Select } from "@/components/ui/select";
import { StatusTag } from "@/components/ui/status-tag";
import { toast } from "@/components/ui/toast";
import useDeferred from "@/lib/hooks/use-deferred";
import { useMemo, useState } from "react";

interface Props {
    campaigns: App.Data.AdCampaignData[];
    adSets: App.Data.AdSetData[];
}

export default function Upload({ campaigns, adSets }: Props) {
    const { isLoading: isLoadingCampaigns } = useDeferred({
        data: "campaigns",
    });
    const { isLoading: isLoadingAdSets } = useDeferred({
        data: "adSets",
    });

    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [selectedAdSet, setSelectedAdSet] = useState("");

    const filteredAdSets = useMemo(() => {
        if (!selectedCampaign) {
            return adSets;
        }

        return adSets.filter((adSet) => adSet.campaignId === selectedCampaign);
    }, [selectedCampaign, adSets]);

    return (
        <Layout title="Upload">
            <div className="grid grid-cols-2 h-full gap-5">
                <div className="bg-white shadow-base rounded-xl overflow-y-auto max-h-full">
                    <div className="p-5 border-b border-gray-100">
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
                                                      <div className="font-semibold truncate">
                                                          {campaign.name}
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

                    <div className="p-5">
                        <pre className="font-sans text-xs">
                            {JSON.stringify(
                                {
                                    selectedCampaign,
                                    selectedAdSet,
                                    campaigns,
                                    adSets,
                                },
                                null,
                                2
                            )}
                        </pre>

                        <button
                            onClick={() => {
                                toast({ contents: "4 ad sets updated" });
                            }}
                            className="cursor-pointer mt-5"
                        >
                            toast
                        </button>
                    </div>
                </div>
                <div className="bg-white shadow-base p-5 rounded-xl overflow-y-auto max-h-full"></div>
            </div>
        </Layout>
    );
}
