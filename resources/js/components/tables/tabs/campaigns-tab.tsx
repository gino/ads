import { useSelectedCampaigns } from "@/pages/campaigns";
import { Route, SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { useMemo } from "react";
import { Tab } from "./tab";

export function CampaignsTab() {
    const routeName: Route = "dashboard.campaigns";

    const { props } = usePage<SharedData>();

    const isActive = useMemo(() => {
        return props.ziggy.route === routeName;
    }, [props.ziggy.route, routeName]);

    const [selectedCampaigns, setSelectedCampaigns] = useSelectedCampaigns();

    const selectedCampaignsAmount = useMemo(
        () => Object.keys(selectedCampaigns).length,
        [selectedCampaigns]
    );

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
            <span>Campaigns</span>
            {selectedCampaignsAmount > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand text-white text-[12px] pl-2.5 pr-2 rounded-full leading-5 flex items-center">
                    <span>{selectedCampaignsAmount} selected</span>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCampaigns({});
                        }}
                        className="text-[9px] ml-1 cursor-pointer"
                    >
                        <i className="fa-solid fa-times" />
                    </div>
                </div>
            )}
        </Tab>
    );
}
