import { StatusTag } from "@/components/ui/status-tag";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { formatMoneyWithLocale } from "@/lib/number-utils";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { CommandItem } from "../command-item";
import { CommandSubMenu } from "../command-sub-menu";
import { ShortcutButtonHint } from "../components/shortcut-hint";
import { useCommandMenu } from "../store";

export function AdSets() {
    const [adSets, setAdSets] = useState<App.Data.AdSetData[]>([]);
    const { setIsOpen, isLoading, setIsLoading, setSelectedItemData } =
        useCommandMenu();

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
                    id="adset-item"
                    onSelect={() => {
                        setIsOpen(false);
                        router.visit(
                            route("dashboard.campaigns.adSets", {
                                _query: {
                                    selected_adset_ids: adSet.id,
                                },
                            })
                        );
                    }}
                    onSelectedChange={() => {
                        setSelectedItemData(adSet);
                    }}
                    keywords={[adSet.id, adSet.name]}
                    value={adSet.id}
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

export function AdSetContextMenu() {
    const { selectedItemData } = useCommandMenu();
    const adSet = selectedItemData as App.Data.AdSetData;

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
                        {adSet.dailyBudget && (
                            <Command.Item
                                onSelect={() => {
                                    setIsOpen(false);
                                }}
                                className="data-[selected='true']:bg-gray-100 group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                            >
                                <div className="flex items-center truncate">
                                    <div className="flex-1 truncate">
                                        Update daily budget
                                    </div>

                                    <div className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[selected='true']:bg-gray-200">
                                        {formatMoneyWithLocale(
                                            parseInt(adSet.dailyBudget) / 100,
                                            selectedAdAccount.currency
                                        )}
                                    </div>
                                </div>
                            </Command.Item>
                        )}

                        <Command.Item
                            onSelect={() => {
                                setIsOpen(false);
                            }}
                            className="data-[selected='true']:bg-gray-100 group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                        >
                            <div className="flex items-center truncate">
                                <div className="flex-1 truncate">
                                    {adSet.status === "ACTIVE"
                                        ? "Turn ad set off"
                                        : "Turn ad set on"}
                                </div>
                            </div>
                        </Command.Item>
                        <Command.Separator className="bg-gray-100 h-px my-1 -mx-1" />
                        <Command.Item
                            onSelect={() => {
                                setIsOpen(false);
                            }}
                            className="data-[selected='true']:bg-gray-100 group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                        >
                            <div className="flex items-center truncate">
                                <div className="flex-1 truncate">
                                    View ad set insights
                                </div>
                            </div>
                        </Command.Item>
                    </Command.Group>
                </Command.List>
            </Command>
        </CommandSubMenu>
    );
}
