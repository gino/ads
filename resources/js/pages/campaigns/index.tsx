import { Layout as AppLayout } from "@/components/layouts/app-layout";
import { CampaignsTable } from "@/components/tables/campaigns-table";
import { parseAsRowSelection } from "@/components/tables/utils";
import { cn } from "@/lib/cn";
import useDeferred from "@/lib/hooks/use-deferred";
import { SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { useQueryState } from "nuqs";
import { PropsWithChildren, useMemo } from "react";

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
    const { props } = usePage<SharedData>();

    const [selectedCampaigns, setSelectedCampaigns] = useSelectedCampaigns();

    const selectedCampaignsAmount = useMemo(
        () => Object.keys(selectedCampaigns).length,
        [selectedCampaigns]
    );

    const tabs = useMemo(
        () => [
            {
                key: "campaigns",
                route: "dashboard.campaigns",
                defaultLabel: "Campaigns",
                selectedLabel: (count: number) => `Campaigns`,
                showSelectedBadge: true,
            },
            {
                key: "adSets",
                route: "dashboard.campaigns.adSets",
                defaultLabel: "Ad sets",
                selectedLabel: (count: number) =>
                    `Ad sets for ${count} campaign${count > 1 ? "s" : ""}`,
            },
            {
                key: "ads",
                route: "dashboard.campaigns.ads",
                defaultLabel: "Ads",
                selectedLabel: (count: number) =>
                    `Ads for ${count} campaign${count > 1 ? "s" : ""}`,
            },
        ],
        []
    );

    return (
        <AppLayout title="Campaigns">
            <div className="bg-white shadow-base rounded-xl overflow-hidden">
                <div className="flex items-center bg-gray-50 border-b border-gray-100 overflow-hidden">
                    {tabs.map((tab) => {
                        const isSelected = selectedCampaignsAmount > 0;
                        const label = isSelected
                            ? tab.selectedLabel(selectedCampaignsAmount)
                            : tab.defaultLabel;

                        return (
                            <button
                                key={tab.key}
                                // This prefetching could maybe work but isn't supported for deferred props it seems like
                                // https://github.com/inertiajs/inertia/issues/2108#event-18640816336
                                // onMouseOver={() => {
                                //     router.prefetch(
                                //         route(tab.route) + location.search  ,
                                //         {
                                //             method: "get",
                                //             only: ["campaigns"],
                                //         },
                                //         {
                                //             cacheFor: "5m",
                                //         }
                                //     );
                                // }}
                                onClick={() => {
                                    if (props.ziggy.route === tab.route) {
                                        return;
                                    }

                                    router.visit(
                                        route(tab.route) + location.search
                                    );
                                }}
                                className={cn(
                                    "w-72 px-5 py-3.5 rounded-t-xl font-semibold flex items-center gap-2.5 cursor-pointer relative",
                                    props.ziggy.route === tab.route &&
                                        "bg-white shadow-base"
                                )}
                            >
                                <i className="fa-solid fa-folder text-[12px] text-gray-300" />
                                <span>{label}</span>

                                {tab.showSelectedBadge &&
                                    selectedCampaignsAmount > 0 && (
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-teal-600 text-white text-[12px] pl-2.5 pr-2 rounded-full leading-5 flex items-center">
                                            <span>
                                                {selectedCampaignsAmount}{" "}
                                                selected
                                            </span>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCampaigns({});
                                                }}
                                                className="text-[9px] ml-1 cursor-pointer"
                                            >
                                                <i className="fa-solid fa-times align-middle" />
                                            </div>
                                        </div>
                                    )}
                            </button>
                        );
                    })}
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
