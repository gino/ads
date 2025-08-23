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
            <i className="fa-solid fa-folder text-gray-300" />
            <span>{label}</span>

            {selectedAdsAmount > 0 && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-brand text-white text-[12px] pl-2.5 pr-2 rounded-full leading-5 flex items-center">
                    <span>{selectedAdsAmount} selected</span>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAds({});
                        }}
                        className="text-[9px] ml-1 cursor-pointer"
                    >
                        <i className="fa-solid fa-times align-middle" />
                    </div>
                </div>
            )}
        </Tab>
    );
}
