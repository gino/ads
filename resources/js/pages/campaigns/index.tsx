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
            <div className="flex flex-col max-h-full">
                <div className="mb-2">
                    {/* <div className="flex justify-end mb-4 pb-4 border-b border-gray-100">
                        <DateFilter />
                    </div> */}

                    <div className="bg-gray-100 p-1 rounded-xl flex flex-1 gap-2 items-center">
                        <button className="bg-white px-5 w-full font-semibold cursor-pointer py-2.5 rounded-lg shadow-base flex items-center justify-center">
                            <span>Campaigns</span>
                        </button>

                        <button className="px-5 w-full font-semibold cursor-pointer py-2.5 rounded-lg flex items-center justify-center">
                            <span>Ad sets</span>
                        </button>

                        <button className="px-5 w-full font-semibold cursor-pointer py-2.5 rounded-lg flex items-center justify-center">
                            <span>Ads</span>
                        </button>

                        <div className="flex items-center">
                            <div className="mr-px">
                                <div className="w-px h-6 bg-gray-200 mx-3"></div>
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

    return (
        <AppLayout title="Campaigns">
            <div className="bg-white shadow-base flex flex-col rounded-xl overflow-hidden max-h-full">
                <div className="flex flex-shrink-0 items-center bg-gray-50 border-b border-gray-100 overflow-x-auto relative">
                    <CampaignsTab />
                    <AdSetsTab />
                    <AdsTab />

                    <div className="ml-auto pl-4 pr-[5px]">
                        <DateFilter />
                    </div>

                    {/* <div className="absolute right-0 px-[5px] inset-y-0 flex items-center bg-[inherit]">
                        <DateFilter />
                    </div> */}
                </div>

                {/* <div className="p-2 border-b border-gray-100 flex justify-end">
                    <DateFilter />
                </div> */}

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
