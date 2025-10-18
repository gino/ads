import { Layout as AppLayout } from "@/components/layouts/app-layout";
import { CampaignsTable } from "@/components/tables/campaigns-table";
import { DateFilter } from "@/components/tables/date-filter";
import { AdsTab } from "@/components/tables/tabs/ads-tab";
import { AdSetsTab } from "@/components/tables/tabs/adsets-tab";
import { CampaignsTab } from "@/components/tables/tabs/campaigns-tab";
import useDeferred from "@/lib/hooks/use-deferred";
import { parseAsRowSelection } from "@/lib/query-parsers/table-row-selection-parser";
import { parseAsTableSorting } from "@/lib/query-parsers/table-sorting-parser";
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
            <div className="p-3 flex flex-col max-h-full">
                <div className="mb-3">
                    <div className="bg-gray-100 p-1 rounded-xl ring-inset ring-1 ring-gray-200/30 flex flex-1 items-center">
                        <div className="flex items-center flex-1 gap-3">
                            <CampaignsTab />
                            <AdSetsTab />
                            <AdsTab />
                        </div>

                        <div className="flex items-center mr-px">
                            <div className="mx-px">
                                <div className="w-px h-5 bg-gray-200 mx-3" />
                            </div>
                            <DateFilter />
                        </div>
                    </div>
                </div>
                <div className="bg-white flex-1 shadow-base flex flex-col rounded-xl overflow-hidden max-h-full">
                    <div className="flex-1 flex flex-col min-h-full">
                        {children}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

const EMPTY_SELECTION = {};
const EMPTY_ARRAY: any[] = [];

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

export function useSortingState() {
    return useQueryState("sort", parseAsTableSorting.withDefault(EMPTY_ARRAY));
}
