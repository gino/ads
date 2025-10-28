import { StatusTag } from "@/components/ui/status-tag";
import { toast } from "@/components/ui/toast";
import useDebouncedBatch from "@/lib/hooks/use-debounced-batch";
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
import { CampaignPageMeta } from "./campaigns";

export function Ads() {
    const [ads, setAds] = useState<App.Data.AdData[]>([]);
    const [cacheKey, setCacheKey] = useState("");

    const { setIsOpen, isLoading, setIsLoading, pageMeta } = useCommandMenu();

    const meta = pageMeta as CampaignPageMeta;

    const filteredAds = useMemo(() => {
        if (meta.campaign) {
            return ads.filter((ad) => ad.campaignId === meta.campaign.id);
        }

        return ads;
    }, [ads, meta]);

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const selected = useMemo(() => {
        return filteredAds.find((c) => c.id === selectedId) ?? null;
    }, [selectedId, filteredAds]);

    useEffect(() => {
        setIsLoading(true);
        axios
            .get(route("command-menu.api.ads"))
            .then(({ data }) => {
                setAds(data.ads);
                setCacheKey(data.cacheKey);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [setIsLoading]);

    const { enqueue } = useDebouncedBatch<App.Data.AdData>({
        waitMs: 2_000,
        maxWaitMs: 10_000,
        key: (ad) => ad.id,
        coalesce: (prev, next) => {
            if (prev && prev.status === next.status) return null;
            return next;
        },
        onFlush: async (items) => {
            try {
                await axios.patch(route("ads.status.update"), {
                    entries: items,
                    cacheKey,
                });
            } catch (err) {
                const error = err as AxiosError<{ message: string }>;

                if (error.response?.status === 422) {
                    // https://claude.ai/chat/4797a66e-1f37-420e-926a-c5d39b9f1f63
                    toast({
                        type: "ERROR",
                        contents:
                            error.response.data?.message ||
                            "There was an error updating the status of your ads",
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

    if (filteredAds.length === 0 || isLoading) {
        return null;
    }

    return (
        <CommandGroup>
            {meta.campaign && (
                <div className="mb-2">
                    <span className="font-semibold bg-gray-100 text-[12px] px-2 inline-block rounded-full leading-5 group-data-[selected='true']:bg-gray-200">
                        {meta.campaign?.name}
                    </span>
                </div>
            )}

            {filteredAds.map((ad) => (
                <CommandItem
                    key={ad.id}
                    id="ad-item"
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
                    onSelectedChange={(selected) => {
                        if (selected) {
                            setSelectedId(ad.id);
                        }
                    }}
                    keywords={[ad.id, ad.name]}
                    value={ad.id}
                >
                    <div className="flex gap-3 items-center truncate">
                        <StatusTag status={ad.status} showLabel={false} />
                        <div className="font-semibold truncate">{ad.name}</div>
                    </div>
                </CommandItem>
            ))}

            {selected && (
                <AdContextMenu
                    ad={selected}
                    handleAdStatusChange={(adId, status) => {
                        const ad = filteredAds.find((a) => a.id === adId);

                        if (!ad) return;

                        setAds((data) => {
                            return data.map((ad) =>
                                ad.id === adId ? { ...ad, status: status } : ad
                            );
                        });

                        enqueue({
                            ...ad,
                            status,
                        });
                    }}
                />
            )}
        </CommandGroup>
    );
}

interface AdContextMenuProps {
    ad: App.Data.AdData;
    handleAdStatusChange: (
        adId: string,
        status: App.Data.AdData["status"]
    ) => void;
}

function AdContextMenu({ ad, handleAdStatusChange }: AdContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { setIsOpen: setCommandMenuIsOpen } = useCommandMenu();

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
                    <CommandSubItem
                        onSelect={() => {
                            setIsOpen(false);
                            handleAdStatusChange(
                                ad.id,
                                ad.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
                            );
                        }}
                    >
                        <div className="flex items-center truncate">
                            <div className="flex-1 truncate">
                                {ad.status === "ACTIVE"
                                    ? "Turn ad off"
                                    : "Turn ad on"}
                            </div>
                        </div>
                    </CommandSubItem>
                    <CommandSeparator />
                    <CommandSubItem
                        onSelect={() => {
                            setIsOpen(false);
                            setCommandMenuIsOpen(false);
                            router.visit(
                                route("dashboard.campaigns.ads", {
                                    _query: {
                                        selected_ad_ids: ad.id,
                                    },
                                })
                            );
                        }}
                    >
                        <div className="flex items-center truncate">
                            <div className="flex-1 truncate">
                                View ad insights
                            </div>
                        </div>
                    </CommandSubItem>
                </Command.List>
            </Command>
        </CommandSubMenu>
    );
}
