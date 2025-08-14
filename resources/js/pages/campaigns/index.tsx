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
            <div>
                <CampaignsTable isLoading={isLoading} campaigns={campaigns} />
            </div>
        </Layout>
    );
}

export function Layout({ children }: PropsWithChildren) {
    return (
        <AppLayout title="Campaigns">
            <div className="bg-white shadow-base rounded-xl overflow-hidden">
                <div className="flex items-center bg-gray-50 border-b border-gray-100 overflow-hidden">
                    <CampaignsTab />
                    <AdSetsTab />
                    <AdsTab />
                </div>

                {children}
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
