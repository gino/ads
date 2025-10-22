import { StatusTag } from "@/components/ui/status-tag";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { CommandItem } from "../command-item";
import { useCommandMenu } from "../store";

export function Ads() {
    const [ads, setAds] = useState<App.Data.AdData[]>([]);
    const { setIsOpen, isLoading, setIsLoading } = useCommandMenu();

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(route("command-menu.api.ads"))
            .then(({ data }) => {
                setAds(data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [setIsLoading]);

    if (ads.length === 0 || isLoading) {
        return null;
    }

    return (
        <Command.Group className="p-2">
            {ads.map((ad) => (
                <CommandItem
                    key={ad.id}
                    onSelect={() => {
                        setIsOpen(false);
                        router.visit(
                            route("dashboard.campaigns.ads", {
                                _query: {
                                    selected_ad_ids: ad.id,
                                },
                            })
                        );
                    }}
                    value={`${ad.id} - ${ad.name}`}
                >
                    <div className="flex gap-3 items-center truncate">
                        <StatusTag status={ad.status} showLabel={false} />
                        <div className="font-semibold truncate">{ad.name}</div>
                    </div>
                </CommandItem>
            ))}
        </Command.Group>
    );
}
