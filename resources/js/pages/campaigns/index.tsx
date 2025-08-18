import { Layout as AppLayout } from "@/components/layouts/app-layout";
import { CampaignsTable } from "@/components/tables/campaigns-table";
import { AdsTab } from "@/components/tables/tabs/ads-tab";
import { AdSetsTab } from "@/components/tables/tabs/adsets-tab";
import { CampaignsTab } from "@/components/tables/tabs/campaigns-tab";
import { parseAsRowSelection } from "@/components/tables/utils";
import useDeferred from "@/lib/hooks/use-deferred";
import { useQueryState } from "nuqs";
import { PropsWithChildren } from "react";

interface Props {
    campaigns: App.Data.AdCampaignData[];
}

export default function Campaigns({ campaigns }: Props) {
    const { isLoading } = useDeferred({ data: "campaigns" });

    return (
        <Layout>
            <CampaignsTable isLoading={isLoading} campaigns={campaigns} />
        </Layout>
    );
}

export function Layout({ children }: PropsWithChildren) {
    return (
        <AppLayout title="Campaigns">
            <div className="bg-white shadow-base flex flex-col rounded-xl overflow-hidden max-h-full">
                <div className="flex flex-shrink-0 items-center bg-gray-50 border-b border-gray-100 overflow-hidden relative">
                    <CampaignsTab />
                    <AdSetsTab />
                    <AdsTab />

                    <div className="ml-auto mr-[5px]">
                        <button className="bg-white text-xs shadow-base pl-3 pr-3.5 min-w-72 py-2.5 flex items-center gap-2 rounded-lg">
                            <i className="fa-regular fa-calendar text-[14px] text-gray-400" />
                            <span className="font-semibold flex-1 text-left">
                                15 Aug 2025 - 16 Aug 2025
                            </span>

                            <i className="fa-solid fa-chevron-down text-gray-400 text-[12px]" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-full">
                    {children}
                </div>
            </div>
        </AppLayout>
    );
}

export function useSelectedCampaigns() {
    return useQueryState(
        "selected_campaign_ids",
        parseAsRowSelection.withDefault({})
    );
}

export function useSelectedAdSets() {
    return useQueryState(
        "selected_adset_ids",
        parseAsRowSelection.withDefault({})
    );
}

export function useSelectedAds() {
    return useQueryState(
        "selected_ad_ids",
        parseAsRowSelection.withDefault({})
    );
}
