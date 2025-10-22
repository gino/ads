import { StatusTag } from "@/components/ui/status-tag";
import axios from "axios";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { CommandItem } from "../command-item";
import { useCommandMenu } from "../store";

export function AdSets() {
    const [adSets, setAdSets] = useState<App.Data.AdSetData[]>([]);
    const { isLoading, setIsLoading } = useCommandMenu();

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(route("command-menu.api.adSets"))
            .then(({ data }) => {
                setAdSets(data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [setIsLoading]);

    if (adSets.length === 0 || isLoading) {
        return null;
    }

    return (
        <Command.Group className="p-2">
            {adSets.map((adSet) => (
                <CommandItem
                    key={adSet.id}
                    value={`${adSet.id} - ${adSet.name}`}
                >
                    <div className="flex gap-3 items-center truncate">
                        <StatusTag status={adSet.status} showLabel={false} />
                        <div className="font-semibold truncate">
                            {adSet.name}
                        </div>
                    </div>
                </CommandItem>
            ))}
        </Command.Group>
    );
}
