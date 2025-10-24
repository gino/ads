import { StatusTag } from "@/components/ui/status-tag";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { CommandFooterPortal } from "../components/command-footer";
import { CommandItem } from "../components/command-item";
import { CommandSubMenu } from "../components/command-sub-menu";
import { ShortcutButtonHint } from "../components/shortcut-hint";
import { useCommandMenu } from "../store";

export function Ads() {
    const [ads, setAds] = useState<App.Data.AdData[]>([]);
    const { setIsOpen, isLoading, setIsLoading } = useCommandMenu();

    const [selected, setSelected] = useState<App.Data.AdData | null>(null);

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
                    onSelectedChange={() => {
                        setSelected(ad);
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

            <AdContextMenu ad={selected} />
        </Command.Group>
    );
}

interface AdContextMenuProps {
    ad: App.Data.AdData | null;
}

export function AdContextMenu({ ad }: AdContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!ad) {
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
                        <Command.Item
                            onSelect={() => {
                                setIsOpen(false);
                            }}
                            className="data-[selected='true']:bg-gray-100 group px-4 py-3 text-sm rounded-lg cursor-pointer font-semibold truncate"
                        >
                            <div className="flex items-center truncate">
                                <div className="flex-1 truncate">
                                    {ad.status === "ACTIVE"
                                        ? "Turn ad off"
                                        : "Turn ad on"}
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
                                    View ad insights
                                </div>
                            </div>
                        </Command.Item>
                    </Command.Group>
                </Command.List>
            </Command>
        </CommandSubMenu>
    );
}
