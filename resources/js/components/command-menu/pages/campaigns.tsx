import { StatusTag } from "@/components/ui/status-tag";
import { toast } from "@/components/ui/toast";
import useDebouncedBatch from "@/lib/hooks/use-debounced-batch";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { formatMoneyWithLocale } from "@/lib/number-utils";
import { router } from "@inertiajs/react";
import axios, { AxiosError } from "axios";
import { Command } from "cmdk";
import { useEffect, useMemo, useState } from "react";
import { CommandFooterPortal } from "../components/command-footer";
import { CommandGroup } from "../components/command-group";
import { CommandItem } from "../components/command-item";
import { CommandSeparator } from "../components/command-separator";
import { CommandSubItem } from "../components/command-sub-item";
import { CommandSubMenu } from "../components/command-sub-menu";
import { ShortcutButtonHint } from "../components/shortcut-hint";
import { useCommandMenu } from "../store";

export function Campaigns() {
    const [campaigns, setCampaigns] = useState<App.Data.AdCampaignData[]>([]);
    const [cacheKey, setCacheKey] = useState("");

    const { setIsOpen, isLoading, setIsLoading } = useCommandMenu();

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selected = useMemo(() => {
        return campaigns.find((c) => c.id === selectedId) ?? null;
    }, [selectedId, campaigns]);

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(route("command-menu.api.campaigns"))
            .then(({ data }) => {
                setCampaigns(data.campaigns);
                setCacheKey(data.cacheKey);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [setIsLoading]);

    const { enqueue } = useDebouncedBatch<App.Data.AdCampaignData>({
        waitMs: 2_000,
        maxWaitMs: 10_000,
        key: (campaign) => campaign.id,
        coalesce: (prev, next) => {
            if (prev && prev.status === next.status) return null;
            return next;
        },
        onFlush: async (items) => {
            try {
                await axios.patch(route("campaigns.status.update"), {
                    entries: items,
                    cacheKey,
                });
            } catch (err) {
                const error = err as AxiosError<{ message: string }>;

                if (error.response?.status === 422) {
                    toast({
                        type: "ERROR",
                        contents:
                            error.response.data?.message ||
                            "There was an error updating the status of your campaigns",
                    });
                }
            }
        },
        flushOnInertiaNavigate: true,
        flushOnHistoryChange: false,
        flushOnVisibilityHidden: false,
        flushOnPageHide: true,
        flushOnBeforeUnload: false,
    });

    if (campaigns.length === 0 || isLoading) {
        return null;
    }

    return (
        <CommandGroup>
            {campaigns.map((campaign) => (
                <CommandItem
                    key={campaign.id}
                    id="campaign-item"
                    onSelect={() => {
                        setIsOpen(false);
                        router.visit(
                            route("dashboard.campaigns", {
                                _query: {
                                    selected_campaign_ids: campaign.id,
                                },
                            })
                        );
                    }}
                    onSelectedChange={(selected) => {
                        if (selected) {
                            setSelectedId(campaign.id);
                        }
                    }}
                    keywords={[campaign.id, campaign.name]}
                    value={campaign.id}
                >
                    <div className="flex items-center gap-3 w-full truncate">
                        <div className="flex flex-1 gap-3 items-center truncate">
                            <StatusTag
                                status={campaign.effectiveStatus}
                                showLabel={false}
                            />
                            <div className="font-semibold truncate">
                                {campaign.name}
                            </div>
                        </div>
                        <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[selected='true']:bg-gray-200">
                            {campaign.dailyBudget !== null ? "CBO" : "ABO"}
                        </div>
                    </div>
                </CommandItem>
            ))}

            {selected && (
                <CampaignContextMenu
                    campaign={selected}
                    handleCampaignStatusChange={(campaignId, status) => {
                        const campaign = campaigns.find(
                            (c) => c.id === campaignId
                        );

                        if (!campaign) return;

                        setCampaigns((data) => {
                            return data.map((campaign) =>
                                campaign.id === campaignId
                                    ? { ...campaign, effectiveStatus: status }
                                    : campaign
                            );
                        });

                        enqueue({
                            ...campaign,
                            status,
                        });
                    }}
                />
            )}
        </CommandGroup>
    );
}

export type CampaignPageMeta = {
    campaign: {
        id: string;
        name: string;
    };
};

interface CampaignContextMenuProps {
    campaign: App.Data.AdCampaignData;
    handleCampaignStatusChange: (
        campaignId: string,
        status: App.Data.AdCampaignData["status"]
    ) => void;
}

function CampaignContextMenu({
    campaign,
    handleCampaignStatusChange,
}: CampaignContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { setIsOpen: setCommandMenuIsOpen, setPage } = useCommandMenu();
    const { selectedAdAccount } = useSelectedAdAccount();

    return (
        <CommandSubMenu
            setIsOpen={setIsOpen}
            isOpen={isOpen}
            disclosure={(props) => (
                <CommandFooterPortal>
                    <ShortcutButtonHint
                        label="Actions"
                        onClick={() => {
                            setIsOpen((o) => !o);
                        }}
                        keys={[
                            <i className="fa-solid fa-command text-[8px]" />,
                            <span>K</span>,
                        ]}
                        aria-expanded={isOpen}
                        {...props}
                    />
                </CommandFooterPortal>
            )}
        >
            <Command loop className="outline-none">
                <Command.List className="outline-none">
                    {campaign.dailyBudget && (
                        <CommandSubItem
                            onSelect={() => {
                                setIsOpen(false);
                            }}
                        >
                            <div className="flex items-center truncate">
                                <div className="flex-1 truncate">
                                    Update daily budget
                                </div>

                                <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[selected='true']:bg-gray-200">
                                    {formatMoneyWithLocale(
                                        parseInt(campaign.dailyBudget) / 100,
                                        selectedAdAccount.currency
                                    )}
                                </div>
                            </div>
                        </CommandSubItem>
                    )}

                    <CommandSubItem
                        onSelect={() => {
                            setIsOpen(false);

                            handleCampaignStatusChange(
                                campaign.id,
                                campaign.effectiveStatus === "ACTIVE"
                                    ? "PAUSED"
                                    : "ACTIVE"
                            );
                        }}
                    >
                        <div className="flex items-center truncate">
                            <div className="flex-1 truncate">
                                {campaign.effectiveStatus === "ACTIVE"
                                    ? "Turn campaign off"
                                    : "Turn campaign on"}
                            </div>
                        </div>
                    </CommandSubItem>
                    <CommandSeparator />
                    <CommandSubItem
                        onSelect={() => {
                            setIsOpen(false);
                            setPage("ads", {
                                campaign: {
                                    id: campaign.id,
                                    name: campaign.name,
                                },
                            } as CampaignPageMeta);
                        }}
                        className="data-[selected='true']:bg-gray-100 group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                    >
                        <div className="flex items-center truncate">
                            <div className="flex-1 truncate">
                                View related ads
                            </div>
                        </div>
                    </CommandSubItem>
                    <CommandSubItem
                        onSelect={() => {
                            setIsOpen(false);
                            setCommandMenuIsOpen(false);
                            router.visit(
                                route("dashboard.campaigns", {
                                    _query: {
                                        selected_campaign_ids: campaign.id,
                                    },
                                })
                            );
                        }}
                        className="data-[selected='true']:bg-gray-100 group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                    >
                        <div className="flex items-center truncate">
                            <div className="flex-1 truncate">
                                View campaign insights
                            </div>
                        </div>
                    </CommandSubItem>
                </Command.List>
            </Command>
        </CommandSubMenu>
    );
}
