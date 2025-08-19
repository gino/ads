import { Layout as AppLayout } from "@/components/layouts/app-layout";
import { CampaignsTable } from "@/components/tables/campaigns-table";
import { DateFilter } from "@/components/tables/date-filter";
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
                <div className="flex flex-shrink-0 items-center bg-gray-50 border-b border-gray-200 overflow-x-auto relative">
                    <CampaignsTab />
                    <AdSetsTab />
                    <AdsTab />

                    <div className="absolute right-0 px-[5px] inset-y-0 flex items-center bg-[inherit]">
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

const EMPTY_SELECTION = {};

export function useSelectedCampaigns() {
    return useQueryState(
        "selected_campaign_ids",
        parseAsRowSelection.withDefault(EMPTY_SELECTION)
    );
}

export function useSelectedAdSets() {
    return useQueryState(
        "selected_adset_ids",
        parseAsRowSelection.withDefault(EMPTY_SELECTION)
    );
}

export function useSelectedAds() {
    return useQueryState(
        "selected_ad_ids",
        parseAsRowSelection.withDefault(EMPTY_SELECTION)
    );
}
