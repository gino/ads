import { Layout } from "@/components/layouts/app-layout";
import { CampaignsTable } from "@/components/tables/campaigns-table";
import { cn } from "@/lib/cn";
import { Deferred } from "@inertiajs/react";
import { ComponentProps, useMemo, useState } from "react";

interface Props {
    campaigns: App.Data.AdCampaignData[];
}

export default function Campaigns({ campaigns }: Props) {
    const [selectedCampaigns, setSelectedCampaigns] = useState({});

    const selectedCampaignIds = useMemo(
        () => Object.keys(selectedCampaigns),
        [selectedCampaigns]
    );

    const selectedCampaignsAmount = useMemo(
        () => selectedCampaignIds.length,
        [selectedCampaignIds]
    );

    const [activeTab, setActiveTab] = useState<"campaigns" | "adsets" | "ads">(
        "campaigns"
    );

    return (
        <Layout title="Campaigns">
            <div className="bg-white shadow-base rounded-xl overflow-hidden">
                <div className="flex items-center bg-gray-50 border-b border-gray-100 overflow-hidden">
                    <Tab
                        active={activeTab === "campaigns"}
                        onClick={() => setActiveTab("campaigns")}
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
                    </Tab>
                    <Tab
                        active={activeTab === "adsets"}
                        onClick={() => setActiveTab("adsets")}
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
                    </Tab>
                    <Tab
                        active={activeTab === "ads"}
                        onClick={() => setActiveTab("ads")}
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
                    </Tab>
                </div>

                <div className="overflow-hidden">
                    <Deferred data="campaigns" fallback={<div>Loading...</div>}>
                        <div>
                            {activeTab === "campaigns" && (
                                <CampaignsTable
                                    campaigns={campaigns}
                                    onRowSelectionChange={setSelectedCampaigns}
                                    rowSelection={selectedCampaigns}
                                />
                            )}
                        </div>
                    </Deferred>

                    {activeTab === "adsets" && (
                        <div className="p-6">
                            <div>ad sets view</div>
                            {JSON.stringify(selectedCampaignIds)}
                        </div>
                    )}

                    {activeTab === "ads" && (
                        <div className="p-6">
                            <div>ads view</div>
                            {JSON.stringify(selectedCampaignIds)}
                        </div>
                    )}
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
