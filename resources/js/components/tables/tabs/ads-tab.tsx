import { cn } from "@/lib/cn";
import {
    useSelectedAds,
    useSelectedAdSets,
    useSelectedCampaigns,
} from "@/pages/campaigns";
import { Route, SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { useMemo } from "react";
import { Tab } from "./tab";

export function AdsTab() {
    const routeName: Route = "dashboard.campaigns.ads";

    const { props } = usePage<SharedData>();

    const isActive = useMemo(() => {
        return props.ziggy.route === routeName;
    }, [props.ziggy.route, routeName]);

    const [selectedCampaigns] = useSelectedCampaigns();
    const [selectedAdSets, setSelectedAdSet] = useSelectedAdSets();
    const [selectedAds, setSelectedAds] = useSelectedAds();

    const selectedCampaignsAmount = useMemo(
        () => Object.keys(selectedCampaigns).length,
        [selectedCampaigns]
    );

    const selectedAdSetsAmount = useMemo(
        () => Object.keys(selectedAdSets).length,
        [selectedAdSets]
    );

    const selectedAdsAmount = useMemo(
        () => Object.keys(selectedAds).length,
        [selectedAds]
    );

    const label = useMemo(() => {
        if (selectedAdSetsAmount > 0) {
            return `Ads for ${selectedAdSetsAmount} ad set${
                selectedAdSetsAmount === 1 ? "" : "s"
            }`;
        }

        if (selectedAdsAmount > 0) {
            return "Ads";
        }

        if (!(selectedCampaignsAmount > 0)) {
            return "Ads";
        }

        return `Ads for ${selectedCampaignsAmount} campaign${
            selectedCampaignsAmount === 1 ? "" : "s"
        }`;
    }, [selectedCampaignsAmount, selectedAdSetsAmount, selectedAdsAmount]);

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
            {selectedAdsAmount > 0 && (
                <div
                    className={cn(
                        isActive ? "bg-gray-100" : "bg-gray-200",
                        "font-semibold text-[12px] cursor-default inline-flex items-center pl-2 leading-5 rounded-full text-gray-800 ml-2"
                    )}
                >
                    <span>{selectedAdsAmount} selected</span>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAds({});
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
            {/* {selectedAdsAmount > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand text-white text-[12px] pl-2.5 pr-2 rounded-full leading-5 flex items-center">
                    <span>{selectedAdsAmount} selected</span>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAds({});
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
