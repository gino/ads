import { Layout } from "@/components/layouts/app-layout";
import { CampaignsTable } from "@/components/tables/campaigns-table2";
import { cn } from "@/lib/cn";
import { SharedData } from "@/types";
import { Deferred, Link, usePage } from "@inertiajs/react";
import { ComponentProps, useMemo, useState } from "react";

interface Props {
    view: "campaigns" | "adSets" | "ads";
    campaigns: App.Data.AdCampaignData[];
}

export default function Campaigns({ view, campaigns }: Props) {
    const { props } = usePage<SharedData>();

    const currentTab = useMemo(() => {
        const routeName = props.ziggy.route as Parameters<typeof route>[0];

        if (routeName === "dashboard.campaigns") {
            return "campaigns";
        }

        if (routeName === "dashboard.campaigns.adSets") {
            return "adSets";
        }

        if (routeName === "dashboard.campaigns.ads") {
            return "ads";
        }
    }, [props.ziggy.route]);

    const [selectedCampaigns, setSelectedCampaigns] = useState({});

    const selectedCampaignIds = useMemo(
        () => Object.keys(selectedCampaigns),
        [selectedCampaigns]
    );

    const selectedCampaignsAmount = useMemo(
        () => selectedCampaignIds.length,
        [selectedCampaignIds]
    );

    return (
        <Layout title="Campaigns">
            <div className="bg-white shadow-base rounded-xl overflow-hidden">
                <div className="flex items-center bg-gray-50 border-b border-gray-100 overflow-hidden">
                    <Link
                        href={route("dashboard.campaigns")}
                        replace
                        preserveScroll
                        preserveState
                        className="w-72 px-5 py-3.5 rounded-t-xl font-semibold flex items-center gap-2.5 cursor-pointer relative aria-selected:bg-white aria-selected:shadow-base"
                    >
                        <i className="fa-solid fa-folder text-[12px] text-gray-300" />
                        <span>Campaigns</span>
                        {selectedCampaignsAmount > 0 && (
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-teal-600 text-white text-[12px] pl-2.5 pr-2 rounded-full leading-5 flex items-center">
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
                    </Link>
                    <Link
                        href={route("dashboard.campaigns.adSets")}
                        replace
                        preserveScroll
                        preserveState
                        className="w-72 px-5 py-3.5 rounded-t-xl font-semibold flex items-center gap-2.5 cursor-pointer relative aria-selected:bg-white aria-selected:shadow-base"
                    >
                        <i className="fa-solid fa-folder text-[12px] text-gray-300" />
                        {selectedCampaignsAmount > 0 ? (
                            <span>
                                Ad sets for {selectedCampaignsAmount} campaign
                                {selectedCampaignsAmount > 1 ? "s" : ""}
                            </span>
                        ) : (
                            <span>Ad sets</span>
                        )}
                    </Link>
                    <Link
                        href={route("dashboard.campaigns.ads")}
                        replace
                        preserveScroll
                        preserveState
                        className="w-72 px-5 py-3.5 rounded-t-xl font-semibold flex items-center gap-2.5 cursor-pointer relative aria-selected:bg-white aria-selected:shadow-base"
                    >
                        <i className="fa-solid fa-folder text-[12px] text-gray-300" />
                        {selectedCampaignsAmount > 0 ? (
                            <span>
                                Ads for {selectedCampaignsAmount} campaign
                                {selectedCampaignsAmount > 1 ? "s" : ""}
                            </span>
                        ) : (
                            <span>Ads</span>
                        )}
                    </Link>
                </div>

                <div>
                    <Deferred
                        data="campaigns"
                        fallback={<div className="p-6">Loading...</div>}
                    >
                        <CampaignsTable
                            campaigns={campaigns}
                            onRowSelectionChange={setSelectedCampaigns}
                            rowSelection={selectedCampaigns}
                        />
                    </Deferred>
                </div>
            </div>
        </Layout>
    );
}

function Tab({
    children,
    active,
    className,
    ...props
}: ComponentProps<"button"> & { active?: boolean }) {
    return (
        <button
            className={cn(
                "w-72 px-5 py-3.5 rounded-t-xl font-semibold flex items-center gap-2.5 cursor-pointer relative",
                active && "bg-white shadow-base",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
