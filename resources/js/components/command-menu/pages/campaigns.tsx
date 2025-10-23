import { StatusTag } from "@/components/ui/status-tag";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { CommandItem } from "../command-item";
import { useCommandMenu } from "../store";

export function Campaigns() {
    const [campaigns, setCampaigns] = useState<App.Data.AdCampaignData[]>([]);
    const { setIsOpen, isLoading, setIsLoading } = useCommandMenu();

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
