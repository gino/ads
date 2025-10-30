import { cn } from "@/lib/cn";
import { useSelectedAdSets, useSelectedCampaigns } from "@/pages/campaigns";
import { Route, SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { useMemo } from "react";
import { Tab } from "./tab";

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
        <Tab
            isActive={isActive}
            onClick={() => {
                if (isActive) {
                    return;
                }

                router.visit(route(routeName) + location.search);
            }}
        >
            <span>{label}</span>
            {selectedAdSetsAmount > 0 && (
                <div
                    className={cn(
                        isActive ? "bg-gray-100" : "bg-gray-200",
                        "font-semibold text-[12px] cursor-default inline-flex items-center pl-2 leading-5 rounded-full ml-2"
                    )}
                >
                    <span>{selectedAdSetsAmount} selected</span>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAdSets({});
                        }}
                        className={cn(
                            isActive
                                ? "hover:bg-gray-200"
                                : "hover:bg-gray-300",
                            "h-4.5 w-4.5 mr-px text-[9px] flex items-center justify-center ml-0.5 rounded-full cursor-pointer"
                        )}
                    >
                        <i className="fa-solid fa-times" />
                    </div>
                </div>
            )}
            {isActive && (
                <div className="absolute top-1/2 flex items-center justify-center -translate-y-1/2 right-1.5">
                    <div className="h-7 w-7 group-hover:bg-gray-100 cursor-pointer text-gray-400 group-hover:text-black flex items-center justify-center rounded-md">
                        {false ? (
                            <i className="fa-solid fa-spinner-third animate-spin text-[12px]" />
                        ) : (
                            <i className="fa-solid fa-refresh text-[12px]" />
                        )}
                    </div>
                </div>
            )}
            {/* {selectedAdSetsAmount > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand text-white text-[12px] pl-2.5 pr-2 rounded-full leading-5 flex items-center">
                    <span>{selectedAdSetsAmount} selected</span>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAdSets({});
                        }}
                        className="text-[9px] ml-1 cursor-pointer"
                    >
                        <i className="fa-solid fa-times" />
                    </div>
                </div>
            )} */}
        </Tab>
    );
}
