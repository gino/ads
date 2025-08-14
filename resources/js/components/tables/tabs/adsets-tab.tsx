import { cn } from "@/lib/cn";
import { useSelectedAdSets, useSelectedCampaigns } from "@/pages/campaigns";
import { Route, SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { useMemo } from "react";

export function AdSetsTab() {
    const routeName: Route = "dashboard.campaigns.adSets";

    const { props } = usePage<SharedData>();

    const isActive = useMemo(() => {
        return props.ziggy.route === routeName;
    }, [props.ziggy.route, routeName]);

    const [selectedCampaigns] = useSelectedCampaigns();
    const [selectedAdSets, setSelectedAdSets] = useSelectedAdSets();

    const selectedCampaignsAmount = useMemo(
        () => Object.keys(selectedCampaigns).length,
        [selectedCampaigns]
    );

    const selectedAdSetsAmount = useMemo(
        () => Object.keys(selectedAdSets).length,
        [selectedAdSets]
    );

    const label = useMemo(() => {
        if (!(selectedCampaignsAmount > 0)) {
            return "Ad sets";
        }

        if (selectedAdSetsAmount > 0) {
            return "Ad sets";
        }

        return `Ad sets for ${selectedCampaignsAmount} campaign${
            selectedCampaignsAmount === 1 ? "" : "s"
        }`;
    }, [selectedCampaignsAmount, selectedAdSetsAmount]);

    return (
        <button
            onClick={() => {
                if (isActive) {
                    return;
                }

                router.visit(route(routeName) + location.search);
            }}
            className={cn(
                "w-72 px-5 py-3.5 rounded-t-xl font-semibold flex items-center gap-2.5 cursor-pointer relative",
                isActive && "bg-white shadow-base"
            )}
        >
            <i className="fa-solid fa-folder text-[12px] text-gray-300" />
            <span>{label}</span>

            {selectedAdSetsAmount > 0 && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-teal-600 text-white text-[12px] pl-2.5 pr-2 rounded-full leading-5 flex items-center">
                    <span>{selectedAdSetsAmount} selected</span>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAdSets({});
                        }}
                        className="text-[9px] ml-1 cursor-pointer"
                    >
                        <i className="fa-solid fa-times align-middle" />
                    </div>
                </div>
            )}
        </button>
    );
}
