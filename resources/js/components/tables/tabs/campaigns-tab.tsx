import { cn } from "@/lib/cn";
import { useSelectedCampaigns } from "@/pages/campaigns";
import { Route, SharedData } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { useMemo } from "react";

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
        <button
            onClick={() => {
                if (isActive) {
                    return;
                }

                router.visit(route(routeName) + location.search);
            }}
            className={cn(
                "w-80 px-5 py-3.5 rounded-t-xl font-semibold flex items-center gap-2.5 cursor-pointer relative",
                isActive && "bg-white border-r border-t border-gray-100 -mt-px"
            )}
        >
            <i className="fa-solid fa-folder text-gray-300" />
            <span>Campaigns</span>

            {selectedCampaignsAmount > 0 && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-brand text-white text-[12px] pl-2.5 pr-2 rounded-full leading-5 flex items-center">
                    <span>{selectedCampaignsAmount} selected</span>
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
}
