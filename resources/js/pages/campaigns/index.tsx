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
                <div className="flex flex-shrink-0 items-center bg-gray-50 border-b border-gray-100 overflow-x-auto relative">
                    <CampaignsTab />
                    <AdSetsTab />
                    <AdsTab />

                    <div className="ml-auto pl-3 mr-[5px] shrink-0">
                        <DateFilter />
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-full">
                    {children}
                </div>
            </div>
        </AppLayout>
    );
}

function DateFilter() {
    return (
        <button className="bg-white text-xs shadow-base pl-3 pr-3.5 shrink-0 py-2.5 flex items-center gap-2 rounded-lg">
            <i className="fa-regular fa-calendar text-xs text-gray-400" />
            <span className="font-semibold flex-1 text-left">
                Today: 18 Aug 2025
            </span>

            <i className="fa-solid fa-chevron-down text-gray-400 text-[12px] ml-4" />
        </button>
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
