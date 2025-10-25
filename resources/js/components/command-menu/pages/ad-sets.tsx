import { StatusTag } from "@/components/ui/status-tag";
import useDebouncedBatch from "@/lib/hooks/use-debounced-batch";
import { useSelectedAdAccount } from "@/lib/hooks/use-selected-ad-account";
import { formatMoneyWithLocale } from "@/lib/number-utils";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Command } from "cmdk";
import { useEffect, useMemo, useState } from "react";
import { CommandFooterPortal } from "../components/command-footer";
import { CommandItem } from "../components/command-item";
import { CommandSeparator } from "../components/command-separator";
import { CommandSubItem } from "../components/command-sub-item";
import { CommandSubMenu } from "../components/command-sub-menu";
import { ShortcutButtonHint } from "../components/shortcut-hint";
import { useCommandMenu } from "../store";

export function AdSets() {
    const [adSets, setAdSets] = useState<App.Data.AdSetData[]>([]);
    const [cacheKey, setCacheKey] = useState("");

    const { setIsOpen, isLoading, setIsLoading } = useCommandMenu();

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selected = useMemo(() => {
        return adSets.find((c) => c.id === selectedId) ?? null;
    }, [selectedId, adSets]);

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(route("command-menu.api.adSets"))
            .then(({ data }) => {
                setAdSets(data.adSets);
                setCacheKey(data.cacheKey);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [setIsLoading]);

    const { enqueue } = useDebouncedBatch<App.Data.AdSetData>({
        waitMs: 2_000,
        maxWaitMs: 10_000,
        key: (adSet) => adSet.id,
        coalesce: (prev, next) => {
            if (prev && prev.status === next.status) return null;
            return next;
        },
        onFlush: async (items) => {
            console.log("Sending batch to backend", items);
            await axios.patch(route("adSets.status.update"), {
                entries: items,
                cacheKey,
            });
        },
        flushOnInertiaNavigate: true,
        flushOnHistoryChange: false,
        flushOnVisibilityHidden: false,
        flushOnPageHide: true,
        flushOnBeforeUnload: false,
    });

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
                    onSelectedChange={(selected) => {
                        if (selected) {
                            setSelectedId(adSet.id);
                        }
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

            <AdSetContextMenu
                adSet={selected}
                handleAdSetStatusChange={(adSetId, status) => {
                    const adSet = adSets.find((a) => a.id === adSetId);

                    if (!adSet) return;

                    setAdSets((data) => {
                        return data.map((adSet) =>
                            adSet.id === adSetId
                                ? { ...adSet, status: status }
                                : adSet
                        );
                    });

                    enqueue({
                        ...adSet,
                        status,
                    });
                }}
            />
        </Command.Group>
    );
}

interface AdSetContextMenuProps {
    adSet: App.Data.AdSetData | null;
    handleAdSetStatusChange: (
        adSetId: string,
        status: App.Data.AdSetData["status"]
    ) => void;
}

function AdSetContextMenu({
    adSet,
    handleAdSetStatusChange,
}: AdSetContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { setIsOpen: setCommandMenuIsOpen } = useCommandMenu();
    const { selectedAdAccount } = useSelectedAdAccount();

    if (!adSet) {
        return null;
    }

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
                    <Command.Group>
                        {adSet.dailyBudget && (
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
                                            parseInt(adSet.dailyBudget) / 100,
                                            selectedAdAccount.currency
                                        )}
                                    </div>
                                </div>
                            </CommandSubItem>
                        )}

                        <CommandSubItem
                            onSelect={() => {
                                setIsOpen(false);
                                handleAdSetStatusChange(
                                    adSet.id,
                                    adSet.status === "ACTIVE"
                                        ? "PAUSED"
                                        : "ACTIVE"
                                );
                            }}
                        >
                            <div className="flex items-center truncate">
                                <div className="flex-1 truncate">
                                    {adSet.status === "ACTIVE"
                                        ? "Turn ad set off"
                                        : "Turn ad set on"}
                                </div>
                            </div>
                        </CommandSubItem>
                        <CommandSeparator />
                        <CommandSubItem
                            onSelect={() => {
                                setIsOpen(false);
                                setCommandMenuIsOpen(false);
                                router.visit(
                                    route("dashboard.campaigns.adSets", {
                                        _query: {
                                            selected_adset_ids: adSet.id,
                                        },
                                    })
                                );
                            }}
                        >
                            <div className="flex items-center truncate">
                                <div className="flex-1 truncate">
                                    View ad set insights
                                </div>
                            </div>
                        </CommandSubItem>
                    </Command.Group>
                </Command.List>
            </Command>
        </CommandSubMenu>
    );
}
