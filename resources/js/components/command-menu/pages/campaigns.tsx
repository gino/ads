import { StatusTag } from "@/components/ui/status-tag";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { CommandItem } from "../command-item";
import { CommandSubMenu } from "../command-sub-menu";
import { ShortcutButtonHint } from "../components/shortcut-hint";
import { useCommandMenu } from "../store";

export function Campaigns() {
    const [campaigns, setCampaigns] = useState<App.Data.AdCampaignData[]>([]);
    const { setIsOpen, isLoading, setIsLoading, setSelectedItemData } =
        useCommandMenu();

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(route("command-menu.api.campaigns"))
            .then(({ data }) => {
                setCampaigns(data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [setIsLoading]);

    if (campaigns.length === 0 || isLoading) {
        return null;
    }

    return (
        <Command.Group className="p-2">
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
                    onSelectedChange={() => {
                        setSelectedItemData(campaign);
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
        </Command.Group>
    );
}

export function CampaignContextMenu() {
    const { selectedItemData } = useCommandMenu();
    const campaign = selectedItemData as App.Data.AdCampaignData;

    const [isOpen, setIsOpen] = useState(false);

    const { selectedAdAccount } = useSelectedAdAccount();

    return (
        <CommandSubMenu
            setIsOpen={setIsOpen}
            isOpen={isOpen}
            disclosure={(props) => (
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
            )}
        >
            <Command loop className="outline-none">
                <Command.List className="outline-none">
                    <Command.Group>
                        {Array(20)
                            .fill(null)
                            .map((_, index) => (
                                <Command.Item
                                    key={index}
                                    onSelect={() => {
                                        setIsOpen(false);
                                    }}
                                    className="data-[selected='true']:bg-gray-100 px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                                >
                                    {JSON.stringify(campaign)} {index + 1}
                                </Command.Item>
                            ))}
                    </Command.Group>
                </Command.List>
            </Command>
        </CommandSubMenu>
    );
}
